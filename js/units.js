function Unit0(parts, color, health, parent) {
    //this.rotSpeed = 1.0;
    this.health =  health;
	this.healthMax = health;
    this.speed = 2.5;
    this.closeEnough = 0.1;
    this.goalPath = [];
    this.goalCurrent = 0;
    this.color = color;
    this.gun = null;
    this.body = new THREE.Object3D();
    this.body.name = "UnitObj";
    this.body.position = parent.selectedBase.mesh.position.clone();
    parent.scene.add(this.body);
    this.parts = [];
    //this.caster = new THREE.Raycaster();
    //this.caster.far = 2;

    var that = this;

    this.init = function() {
        for (var i = 0; i < parts.length; i++)  {
            var part = new UnitPart(color, this, parts[i]);
            this.parts.push(part);

            if(!parts[i].indexOf("torso")) this.mesh = part.mesh;
            if(!parts[i].indexOf("gun")) this.gun = new Bullet([10, 20], 16, .7, color, parent.scene);
        }
        if(this.gun) this.gunTimer = window.setInterval(this.fireEnemies, this.gun.reload);
    };

	this.clean = function() {
		parent.scene.remove(this.body);
        if(this.gun) {
            this.gun.clean();
		    delete this.gun;
            window.clearInterval(this.gunTimer);
        }

        document.body.removeChild(this.healthBar);
	};

    this.goFromBaseToSpawn = function() {
        var posEnd = parent.selectedBase.unitSpawnPosition;
        var posStart = new THREE.Vector3(this.body.position.x, posEnd.y, this.body.position.z);
        this.goalPath.push(parent.sceneMap.getSceneGraphPosition(posStart));
        this.goalPath.push(parent.sceneMap.getSceneGraphPosition(posEnd));

        setTimeout(this.addHealthBar, 1500);
    };

    this.goTo = function(point) {
		if(this.body.position.distanceToSquared(point) <= this.closeEnough*2) {
            this.body.lookAt(point);
            return;
        }
		
        var posStart = parent.sceneMap.getSceneGraphPosition(this.body.position);
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
        for (var i = 0; i < parts.length; i++)
            this.parts[i].meshOutline.visible = flag;
    };

	this.isMoving = function() {
		if (this.mesh && this.goalPath && this.goalPath.length) return true;
		else return false;
	};

	this.fireEnemies = function() {
		var dx = new THREE.Vector3(0);
		for (var i = 0; i < parent.enemy.units.length; i++)
			that.gun.fire(that.body.position, parent.enemy.units[i]);
	};

	this.addHealthBar = function ()	{
        if (that.healthBar) document.body.removeChild(that.healthBar);
		that.healthBar = document.createElement('meter');	
		that.healthBar.innerHTML = "unit";
		that.healthBar.setAttribute('class','healthBar');
		that.healthBar.max = that.healthMax;
		that.healthBar.value = that.health;
		document.body.appendChild(that.healthBar);
	};

	this.updateHealth = function() {
		this.healthBar.value = this.health;
	};

    this.update = function(dt) {
        if (!this.mesh) return;
        //var dTheta = dt * this.rotSpeed;
        //lookTowards(this.mesh, this.goal, dTheta);
        if (this.goalPath && this.goalPath.length) {   
            var currentNode = this.goalPath[this.goalCurrent];  
            //log(currentNode);       
            var currentPoint = parent.sceneMap.pathGraphBoxes[currentNode.x][currentNode.y].center();
            this.body.lookAt(currentPoint);
            if (this.body.position.distanceToSquared(currentPoint) > this.closeEnough) {
                var moveDist = dt * this.speed;
                this.body.translateZ(moveDist);
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

		if (this.gun) this.gun.update(dt);
		
		// move health bar
		if(this.healthBar && this.isMoving()) {
			var pos2d = calc2Dpoint(this.body, parent.camera, parent.renderer);
			var dx = 25-(pos2d.x-300)/60;
			this.healthBar.style.left = pos2d.x - dx + "px"; // TODO
			this.healthBar.style.top = pos2d.y - 40 + "px";
		}

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

    this.init();
}
