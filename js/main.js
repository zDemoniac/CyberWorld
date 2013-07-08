var sceneName = argv.scene ? argv.scene : "game";

var camera, scene, projector, renderer, stats;

var sceneMap = new SceneMap();

var clock = new THREE.Clock(true);

var player = new Player(10, "baseGreen");
//var computer = new Player(10, "baseRed");

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
    //for (var i in result.objects) {
    //    flipYZ(result.objects[i].position);
    //}
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
            computeBoundingBox(obj);

            sceneMap.expandBox(obj.geometry.boundingBox);

            //obj.castShadow = true;
            obj.receiveShadow = true;
            scene.add(obj);

            // add bases
            if (!obj.name.indexOf(player.baseName))  {
                obj.userData = player.addBase(result.objects[obj.name+".Spawn"].position, obj);
            }
        }
    }

    // path finding
    sceneMap.createMapGraph(scene, 1);
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
        if(player.selectedObject) log("selectedObject="+player.selectedObject.name);

        if (player.selectedObject && player.selectedObject.name === "Unit" && intersects[0].object.name === "Floor") {
            //log("GO!");
            player.goUnit(intersects[0].point);
        }
        else {
            player.selectedObject = intersects[0].object;
            if (!player.selectedObject.name.indexOf(player.baseName))
                player.selectedBase = player.selectedObject.userData;

            showInfoPanel(player.selectedObject);
        }
    }
}

function showInfoPanel(object)
{
    infoText.innerHTML = "Object: " + object.name + "<br>";
    if(object.userData.health)
        infoText.innerHTML += "Health: " + object.userData.health + "<br>";
    //infoWindow.style.display = "inline";

    if (!object.name.indexOf(player.baseName)) {
        buttonAddUnit.style.display = "inline";
    } else {
        buttonAddUnit.style.display = "none";
    }
}

function addUnit() {
    player.addUnit(100, scene, sceneMap);
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
        player.update(deltaTime);
        //camera.lookAt( scene.position );
        renderer.render( scene, camera );
    }
    stats.update();
}