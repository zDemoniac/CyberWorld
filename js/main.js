var sceneName = argv.scene ? argv.scene : "game";

var camera, scene, projector, renderer;

var sceneBox = new THREE.Box3();
//var objects = [];
var particleMaterial;

var unitSpawnPosition = null;

var selectedObject = null;

var units = [];

var scenePathGraph = [];

var clock = new THREE.Clock();

//var bgColor = 0x3A3938;

var infoText = document.getElementById("infoText");
var infoWindow = document.getElementById("infoWindow");
var buttonAddUnit = document.getElementById("addUnit");

init();
animate();

function log(text) {
    console.log(text);
}

function init() {
    if ( Detector.webgl )
		renderer = new THREE.WebGLRenderer( {antialias:false} );
	else
		renderer = new THREE.CanvasRenderer();

	renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.shadowMapEnabled = true;
	document.body.appendChild( renderer.domElement );

	camera = new THREE.PerspectiveCamera( 67, window.innerWidth / window.innerHeight, 1, 100 );
    scene = new THREE.Scene();

    projector = new THREE.Projector();

    //addTestCubes();

    var sceneLoader = new THREE.SceneLoader();
	//sceneLoader.callbackProgress = callbackProgress;
    sceneLoader.load( "scenes/"+sceneName+".js", onSceneLoaded);

    //document.addEventListener( 'mousedown', onDocumentMouseDown, false );
    document.getElementsByTagName("canvas")[0].addEventListener( 'mousedown', onDocumentMouseDown, false );
	window.addEventListener( 'resize', onWindowResize, false );

    // displays current and past frames per second attained by scene
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	document.body.appendChild( stats.domElement );
}

function onSceneLoaded(result)
{
    // fix YZ
//    for (var i in result.objects) {
//        flipYZ(result.objects[i].position);
//    }
    //result.lights["default_light"].position = result.objects["Light1"].position
    camera.position = result.objects["CameraMain"].position; 
    var look = result.objects["CameraTarget"].position;
    camera.rotation.set(0);
    camera.lookAt(look);

    //scene.fog = new THREE.Fog( bgColor, 0.00025, 15 );
                
    scene.add( new THREE.AmbientLight( 0xF3F3F3 ) );

  	var light = new THREE.DirectionalLight( 0xdfebff, 0.1 );

    light.castShadow = true;
    //light.shadowCameraVisible = true;
    light.shadowMapWidth = 2048;
    light.shadowMapHeight = 2048;

    var d = 25;
    light.shadowCameraLeft = -d;
    light.shadowCameraRight = d;
    light.shadowCameraTop = d;
    light.shadowCameraBottom = -d;

    light.shadowCameraFar = 70;
    light.shadowDarkness = 0.1;
   	light.position = result.objects["Light1"].position;
   	scene.add( light );

    // add all meshes from loaded to scene
    for (var i in result.objects) {
        var obj = result.objects[i];
        if (obj instanceof THREE.Mesh) {      
            computeBoundigBox(obj);

            sceneBox.expandByPoint(obj.geometry.boundingBox.min);
            sceneBox.expandByPoint(obj.geometry.boundingBox.max);

            //obj.castShadow = true;
            obj.receiveShadow = true;
            scene.add(obj);
        }
    }
    createMapGraph(1);

    // set specific
    unitSpawnPosition = result.objects["BaseGreen.Spawn"].position;
}

function createMapGraph(unitSize)
{
    var shift = 0.15;
    for (var x = sceneBox.min.x; x < sceneBox.max.x; x+=unitSize+shift) {
        var boxes = [];
        for (var z = sceneBox.min.z; z < sceneBox.max.z; z+=unitSize+shift) {
            var box = new THREE.Box3();

            box.min.x = x;            
            box.min.y = sceneBox.min.y + shift;
            box.min.z = z;        

            box.max.x = x + unitSize;            
            box.max.y = sceneBox.min.y + unitSize + shift;
            box.max.z = z + unitSize;

            boxes.push(box);
            var isIntersected = false;
            for (var i in scene.__objects) {
                var obj = scene.__objects[i];
                //log (obj.name.length);
                if (obj instanceof THREE.Mesh && obj.name.length && obj.geometry.boundingBox.isIntersectionBox(box)) {
                    isIntersected = true;
                    break;
                }
            }
            
            drawBoundingBox(box, isIntersected ? 0xaa0000 : 0x00aa00);
        }
        scenePathGraph.push(boxes);
    }      
}

function onDocumentMouseDown( event ) {
    event.preventDefault();

    var vector = new THREE.Vector3((event.clientX/window.innerWidth)*2-1, -(event.clientY/window.innerHeight)*2+1, 0.5);
    projector.unprojectVector( vector, camera );

    var raycaster = new THREE.Raycaster( camera.position, vector.sub(camera.position).normalize() );
    var intersects = raycaster.intersectObjects( scene.__objects, false );

    //log(intersects);

    if (intersects.length > 0) {
        log("intersects[0]="+intersects[0].object.name);
        log(intersects[0].point);
        if(selectedObject) log("selectedObject="+selectedObject.name);

        if (selectedObject && selectedObject.name === "Unit" && intersects[0].object.name === "Floor") {
            log("GO!");
            for ( var i in units) {
                if (units[i].mesh.position == selectedObject.position)
                    units[i].goal = new THREE.Vector3(intersects[0].point.x, units[i].mesh.position.y, intersects[0].point.z);
            }
        }
        else {
            selectedObject = intersects[0].object;

            showInfoPanel(selectedObject.name);
        }
//        var particle = new THREE.Particle( particleMaterial );
//        particle.position = intersects[ 0 ].point;
//        particle.scale.x = particle.scale.y = 8;
//        scene.add( particle );
    }
}

function showInfoPanel(text)
{
    infoText.innerHTML = text;
    //infoWindow.style.display = "inline";

    if (text == "BaseGreen") {
        buttonAddUnit.style.display = "inline";
    } else {
        buttonAddUnit.style.display = "none";
    }
}

function addUnit() {
    var loader = new THREE.JSONLoader();
    units.push(new Unit0(scene, unitSpawnPosition, loader));
}

function onInfoWindowClick() {

}

function onWindowResize() {
    if (camera == null) return;
    camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
    requestAnimationFrame( animate );
    var deltaTime = clock.getDelta();

	if (scene != null && camera != null) {
        for ( var i = 0; i < units.length; i++ )
            units[i].prerender(deltaTime);
        //camera.lookAt( scene.position );
        renderer.render( scene, camera );
    }
    stats.update();
}