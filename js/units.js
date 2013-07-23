function Unit0(health, color, parent) {
    //this.rotSpeed = 1.0;
    this.health =  health;
    this.speed = 2.5;
    this.closeEnough = 0.1;
    this.goalPath = [];
    this.goalCurrent = 0;
    this.dx = new THREE.Vector3();
	this.fireRange = 10;
    this.color = color;
	this.bullet = new Bullet(color, parent.scene);
    //this.caster = new THREE.Raycaster();
    //this.caster.far = 2;

    var that = this;
    this.onGeometry = function(geom, mats) {
//        that.mesh = new THREE.Mesh( geom, new THREE.MeshFaceMaterial(mats));
        that.mesh = new THREE.Mesh( geom, new THREE.MeshPhongMaterial( { ambient: color & 0x999999, color: color } ) );
        that.mesh.position = parent.selectedBase.mesh.position.clone();
        that.mesh.castShadow = true;
        //that.mesh.receiveShadow = true;
        that.mesh.name = "Unit";
        that.mesh.userData = that;
        parent.scene.add(that.mesh);

        // outline
        var outlineMaterial = new THREE.MeshBasicMaterial( { color: that.color, side: THREE.BackSide } );
        that.meshOutline = new THREE.Mesh( geom, outlineMaterial );
        that.meshOutline.name = that.mesh.name + ".Outline";
    	that.meshOutline.position = that.mesh.position;
        that.meshOutline.quaternion = this.mesh.quaternion;
	    that.meshOutline.scale.multiplyScalar(1.05);
	    that.meshOutline.visible = false;
	    parent.scene.add(that.meshOutline);
		var posEnd = parent.selectedBase.unitSpawnPosition;
		var posStart = new THREE.Vector3(that.mesh.position.x, posEnd.y, that.mesh.position.z);
        // go from base to spawn point
        that.goalPath.push(parent.sceneMap.getSceneGraphPosition(posStart));
        that.goalPath.push(parent.sceneMap.getSceneGraphPosition(posEnd));
    };
//    loader.load( "models/unit0.js", onGeometry );    
    this.onGeometry(new THREE.CubeGeometry( 1, 1, 1 ), null);

    this.goTo = function(point) {
		this.dx.subVectors(point, this.mesh.position);
		//log("len: " + this.dx.length());
		if(this.dx.length() <= this.closeEnough*2) return;
		
        var posStart = parent.sceneMap.getSceneGraphPosition(this.mesh.position);
        var posEnd = parent.sceneMap.getSceneGraphPosition(point);
        if (!posStart || !posEnd) {
            log("can't go there :( start: " + posStart + ", end: " + posEnd);
            return;
        }
    
        var start = parent.sceneMap.pathGraph.nodes[posStart.x][posStart.y];
        var end = parent.sceneMap.pathGraph.nodes[posEnd.x][posEnd.y];
        this.goalPath = astar.search(parent.sceneMap.pathGraph.nodes, start, end, true);
        this.goalCurrent = 0;
        //log(this.goalPath);
        //for (var i in this.goalPath)
        //    drawBoundingBox(scenePathGraphBoxes[this.goalPath[i].x][this.goalPath[i].y], 0x0000aa, "debug");  // debug          
    };

    this.select = function(flag) {
        this.meshOutline.visible = flag;      
    };

	this.isMoving = function() {
		if (this.mesh && this.goalPath && this.goalPath.length) return true;
		else return false;
	};

	this.fireEnemies = function() {
		var dx = new THREE.Vector3(0);
		for (var i=0; i<parent.enemy.units.length; i++) {
			var enemy = parent.enemy.units[i];
			dx.subVectors(this.mesh.position, enemy.mesh.position);
			if (dx.length() < this.fireRange) {
				this.bullet.fire(this.mesh.position, enemy);
				break;
			}
		}		
	};

	this.addHealthBar = function ()	{
			  
	};

    this.update = function(dt) {
        if (!this.mesh) return;
        //var dTheta = dt * this.rotSpeed;
        //lookTowards(this.mesh, this.goal, dTheta);
        if (this.goalPath && this.goalPath.length) {   
            var currentNode = this.goalPath[this.goalCurrent];  
            //log(currentNode);       
            var currentPoint = parent.sceneMap.pathGraphBoxes[currentNode.x][currentNode.y].center();
            this.mesh.lookAt(currentPoint);
            this.dx.subVectors(currentPoint, this.mesh.position);
            if (this.dx.length() > this.closeEnough) {
                var moveDist = dt * this.speed;
                this.mesh.translateZ(moveDist);
            }
            else {
                if (this.goalCurrent < this.goalPath.length-1) {
                    this.goalCurrent++;
                }
                else {
                    this.goalPath = null;
                    this.goalCurrent = 0;
                }
            }
        }

		if (this.bullet) {
			this.bullet.update(dt);
			this.fireEnemies();
		}
		// move health bar
		//var pos2d = toScreenXY(this.mesh.position, parent.camera, window.innerWidth, window.innerHeight);
		//this.healthBar.left = pos2d.x;
		//this.healthBar.top = pos2d.y;

//        var direction = new THREE.Vector3(0,0,1).applyQuaternion(this.mesh.quaternion);
//
//        this.caster.set(this.mesh.position, direction);
//
//        var collisions = this.caster.intersectObjects(scene.__objects, false);
//        if (collisions.length) {
//            for (var i = 0; i < collisions.length; i++)
//                log(collisions[i].object.name);
//            this.goal = this.mesh.position;
//        }
    };
}
