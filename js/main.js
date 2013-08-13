function Game() {

	this.camera = null;
	this.scene = null;
	this.projector = null;
	this.renderer = null
	this.stats = null;
	this.sceneMap = null;

	this.clock = new THREE.Clock(true);

	this.player = null;
	this.computer = null;

	this.ai = null;

	//var bgColor = 0x3A3938;
	this.infoTimer;
	this.infoText = document.getElementById("infoText");
	this.infoTextEnergy = document.getElementById("infoTextEnergy");
	this.infoTextHealth = document.getElementById("infoTextHealth");
	this.infoWindow = document.getElementById("infoWindow");
	this.buttonAddUnitDiv = document.getElementById("buttonWrapper");

	this.init = function() {
	    if ( Detector.webgl && !argv.canvas)
			this.renderer = new THREE.WebGLRenderer( {antialias:true} );
		else
			this.renderer = new THREE.CanvasRenderer();
	
		this.renderer.setSize( window.innerWidth, window.innerHeight );
	    this.renderer.shadowMapEnabled = true;
		document.body.appendChild( this.renderer.domElement );
	
		this.camera = new THREE.PerspectiveCamera( 67, window.innerWidth / window.innerHeight, 1, 100 );
	    this.scene = new THREE.Scene();
	
		this.sceneMap = new SceneMap();
	
		this.player =   new Player(7, "baseGreen", this);
		this.computer = new Player(7, "baseRed",   this);
	
		this.player.enemy = this.computer;
		this.computer.enemy = this.player;
	
		this.ai = new AI(this.computer, this.player);
	
	    this.projector = new THREE.Projector();
	
	    var sceneLoader = new THREE.SceneLoader();
		var sceneName = argv.scene ? argv.scene : "game";
		//sceneLoader.callbackProgress = callbackProgress;
	    sceneLoader.load( "scenes/" + sceneName + ".js", this.onSceneLoaded);
	
	    //document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	    document.getElementsByTagName("canvas")[0].addEventListener( 'mousedown', this.onDocumentMouseDown, false );
		window.addEventListener( 'resize', this.onWindowResize, false );
	
	    // displays current and past frames per second attained by scene
		this.stats = new Stats();
		this.stats.domElement.style.position = 'absolute';
		this.stats.domElement.style.bottom = '0px';
		this.stats.domElement.style.zIndex = 100;
		document.body.appendChild( this.stats.domElement );
	
	    // update UI
	    this.infoTimer = window.setInterval(this.UpdateInfoPanel, 500);
	};

	var that = this;

	this.onSceneLoaded = function(result)
	{
	    // fix YZ
	    //for (var i in result.objects) {
	    //    flipYZ(result.objects[i].position);
	    //}
	    that.camera.position = result.objects["CameraMain"].position; 
	    var look = result.objects["CameraTarget"].position;
	    that.camera.rotation.set(0);
	    that.camera.lookAt(look);
	
	    //scene.fog = new THREE.Fog( bgColor, 0.00025, 15 );
	                
	    that.scene.add( new THREE.AmbientLight( 0xbbbbbb ) );
	
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
	   	that.scene.add( light );
	
	    // add all meshes from loaded to scene
	    for (var i in result.objects) {
	        var obj = result.objects[i];
	        if (obj instanceof THREE.Mesh) {      
	            computeBoundingBox(obj);
	
	            that.sceneMap.expandBox(obj.geometry.boundingBox);
	
	            //obj.castShadow = true;
	            obj.receiveShadow = true;
	            that.scene.add(obj);
	
	            // add bases
	            if (!obj.name.indexOf(that.player.baseName))  {
	                obj.userData = that.player.addBase(result.objects[obj.name+".Spawn"].position, obj, 0x00ff00);
	            }
	
	            if (!obj.name.indexOf(that.computer.baseName))  {
	                obj.userData = that.computer.addBase(result.objects[obj.name+".Spawn"].position, obj, 0xff0000);
	            }
	        }
	    }

		// TODO:
		if(that.player.bases.length) {
			for(part in that.player.bases[0].parts) {
				if (!part) break;
				var input = "<input type='checkbox'>" + part + "</input><br>";
				that.buttonAddUnitDiv.innerHTML += input;
			}
			var button = document.createElement('button');
			button.setAttribute('class', 'flat');
			button.setAttribute('id', 'addUnit');
			button.innerHTML = 'add unit';
			button.onclick = this.addUnit;
			that.buttonAddUnitDiv.appendChild(button);
			that.buttonAddUnit = button;
		}
	
	    // path finding
	    that.sceneMap.createMapGraph(that.scene, 1.2);
	};
	
	this.onDocumentMouseDown = function( event ) {
	    event.preventDefault();
	
	    var vector = new THREE.Vector3((event.clientX/window.innerWidth)*2-1, -(event.clientY/window.innerHeight)*2+1, 0.5);
	    that.projector.unprojectVector( vector, that.camera );
	
	    var raycaster = new THREE.Raycaster( that.camera.position, vector.sub(that.camera.position).normalize() );
	    var intersects = raycaster.intersectObjects( that.scene.__objects, false );
	    //log(intersects);
	
	    if (intersects.length > 0) {
	        //log("intersects[0]="+intersects[0].object.name);
	        //log(intersects[0].point);
	
	        if (that.player.selectedObject && that.player.selectedObject.name === "Unit" && intersects[0].object.name === "Floor") {
	            //log("GO!");
	            that.player.goUnit(intersects[0].point);
	        }
	        else {
	            that.player.deselectAll();
				that.computer.deselectAll();
	
	            that.player.selectedObject = intersects[0].object;
	            var data = that.player.selectedObject.userData;
	            
	            if(data.hasOwnProperty("select")) data.select(true);
	    
	            if (!that.player.selectedObject.name.indexOf(that.player.baseName))
	                that.player.selectedBase = data;
	        }
	    }
	
		that.UpdateInfoPanel();
	};
	
	this.UpdateInfoPanel = function()
	{
	    that.infoTextEnergy.innerHTML = "Hum. Energy: " + Math.floor(that.player.energy);
		that.infoTextEnergy.innerHTML += "<br>Comp.Energy: " + Math.floor(that.computer.energy); //dbg
	    
	    var object = that.player.selectedObject;
	
	    that.infoText.innerHTML = "Object: " + (object ? object.name  : "") + "<br>";
	    if(object && object.userData.health)
	        that.infoTextHealth.innerHTML = "Health: " + Math.floor(object.userData.health);
		else
			that.infoTextHealth.innerHTML = "";
	    //infoWindow.style.display = "inline";
	
		if(!object) return;
	
	    if (!object.name.indexOf(that.player.baseName)) {
	        that.buttonAddUnitDiv.style.display = "list-item";

	        if (that.player.energy < that.player.selectedBase.unitCost) 
				that.buttonAddUnit.disabled = true;
	        else 
				that.buttonAddUnit.disabled = false;
	    } else {
	        that.buttonAddUnitDiv.style.display = "none";
	    }
	};
	
	this.addUnit = function() {
	    that.player.addUnit(["torso1", "chassis1", "gun1"], 0x00ff00);
	};
	
	this.onInfoWindowClick = function() {
	
	};
	
	this.onWindowResize = function() {
	    if (that.camera == null) return;
	    that.camera.aspect = window.innerWidth / window.innerHeight;
		that.camera.updateProjectionMatrix();
	
		that.renderer.setSize( window.innerWidth, window.innerHeight );
	};
	
	this.animate = function() {
	    requestAnimationFrame(that.animate,null);
	    var deltaTime = that.clock.getDelta();
	
		if (that.scene != null && that.scene.__objects.length && that.camera != null) {
	        that.player.update(deltaTime);
	        that.computer.update(deltaTime);
	
	        that.renderer.render( that.scene, that.camera );
	    }
	    that.stats.update();
	};

	this.init();
	this.animate();
}

var game = new Game();