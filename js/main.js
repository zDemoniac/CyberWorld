var sceneName = argv.scene ? argv.scene : "game";

var camera, scene, projector, renderer;
var objects = [];
var particleMaterial;

var unitSpawnPosition = THREE.Vector3(0);

var selectedObject  = null;

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
    renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
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
}

function onSceneLoaded(result)
{
    //result.lights["default_light"].position = result.objects["Light1"].position
    camera.position = flipYZ(result.objects["CameraMain"].position); // flipYZ for fix incorrect camera export
    var look = result.objects["CameraTarget"].position;
    camera.lookAt(look);

    //scene.fog = new THREE.Fog( bgColor, 0.00025, 15 );
                
    scene.add( new THREE.AmbientLight( 0xF3F3F3 ) );

  	//var light = new THREE.DirectionalLight( 0xFFEEBB );
   	//light.position.set( -5, 15, -5 );
   	//scene.add( light );

//    var meshLoader = new THREE.JSONLoader();
//    meshLoader.load( "models/base02.js", function( geometry, materials ) {
//        mesh = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
//        scene.add( mesh );
//		mesh.rotation.x += .2;
//    });

    // add all meshes from loaded to scene
    for (object in result.objects) {
        var obj = result.objects[object];
        if (obj instanceof THREE.Mesh)
            scene.add(obj);
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

    if ( intersects.length > 0 ) {
        log("intersects[0]="+intersects[0].object.name);
        if(selectedObject) log("selectedObject="+selectedObject.name);

        if (selectedObject && selectedObject.name === "Unit" && intersects[0].object.name === "Floor") {
            log("GO!");
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
    var geometry = new THREE.CubeGeometry( 1, 1, 1 );
    var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: 0x00ff00 } ) );
    object.position = unitSpawnPosition;
    object.name = "Unit";
    scene.add( object );
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

	if (scene != null && camera != null) {
        //camera.lookAt( scene.position );
        renderer.render( scene, camera );
    }
    isClickGUI = false;
}