var sceneName = argv.scene ? argv.scene : "game";

var camera, scene, projector, renderer;
var objects = [];
var particleMaterial;

var unitSpawnPosition;

var selectedObject  = null;

var units = [];

var clock = new THREE.Clock();

//var bgColor = 0x3A3938;

var infoText = document.getElementById("infoText");
var infoWindow = document.getElementById("infoWindow");
var buttonAddUnit = document.getElementById("addUnit");

init();
animate();

function log(text)
{
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
    //result.lights["default_light"].position = result.objects["Light1"].position
    camera.position = flipYZ(result.objects["CameraMain"].position); // flipYZ for fix incorrect camera export
    var look = result.objects["CameraTarget"].position;
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

//    var meshLoader = new THREE.JSONLoader();
//    meshLoader.load( "models/base02.js", function( geometry, materials ) {
//        mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
//        scene.add( mesh );
//		mesh.rotation.x += .2;
//    });

    // add all meshes from loaded to scene
    for (object in result.objects) {
        var obj = result.objects[object];
        if (obj instanceof THREE.Mesh) {
            //obj.castShadow = true;
            obj.receiveShadow = true;
            scene.add(obj);
        }
    }

    // set specific
    unitSpawnPosition = result.objects["BaseGreen.Spawn"].position;
}

function onDocumentMouseDown( event ) {
    event.preventDefault();

    var projector = new THREE.Projector();
    var vector = new THREE.Vector3((event.clientX/window.innerWidth)*2-1, -(event.clientY/window.innerHeight)*2+1, 0.5);
    projector.unprojectVector( vector, camera );

    var raycaster = new THREE.Raycaster( camera.position, vector.sub(camera.position).normalize() );
    var intersects = raycaster.intersectObjects( scene.__objects );

    log(intersects);

    if (intersects.length > 0) {
        log("intersects[0]="+intersects[0].object.name);
        if(selectedObject) log("selectedObject="+selectedObject.name);

        if (selectedObject && selectedObject.name === "Unit" && intersects[0].object.name === "Floor") {
            log("GO!");
            for ( var i = 0; i < units.length; i++ ) {
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