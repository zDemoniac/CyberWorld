var sceneName = argv.scene ? argv.scene : "game";

var camera, scene, projector, renderer;
var objects = [];
var particleMaterial;
var mesh;

var bgColor = 0x3A3938;

var infoText = document.getElementById("infoText");
var infoWindow = document.getElementById("infoWindow");

init();
animate();
function echo(text)
{
    document.write(text);
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

    document.addEventListener( 'mousedown', onDocumentMouseDown, false );
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
}

function onDocumentMouseDown( event ) {
    event.preventDefault();

    var projector = new THREE.Projector();
    var vector = new THREE.Vector3((event.clientX/window.innerWidth)*2-1, -(event.clientY/window.innerHeight)*2+1, 0.5);
    projector.unprojectVector( vector, camera );

    var raycaster = new THREE.Raycaster( camera.position, vector.sub(camera.position).normalize() );
    var intersects = raycaster.intersectObjects( scene.__objects );

    console.log(intersects);

    if ( intersects.length > 0 ) {
        console.log(intersects[0].object.name);
        infoText.innerHTML = intersects[0].object.name;
        infoWindow.style.display = "inline";
//        var particle = new THREE.Particle( particleMaterial );
//        particle.position = intersects[ 0 ].point;
//        particle.scale.x = particle.scale.y = 8;
//        scene.add( particle );
    }
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
}