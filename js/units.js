
function Unit0(health, color, scene, posBase, posSpawn, loader,sceneMap) {
    //this.rotSpeed = 1.0;
    this.health =  health;
    this.speed = 2.5;
    this.closeEnough = 0.1;
    this.goalPath = [];
    this.goalCurrent = 0;
    this.dx = new THREE.Vector3();
    this.sceneMap = sceneMap;
    this.cost = 5;
    this.color = color;
    //this.caster = new THREE.Raycaster();
    //this.caster.far = 2;

    var that = this;
    this.onGeometry = function(geom, mats) {
//        that.mesh = new THREE.Mesh( geom, new THREE.MeshFaceMaterial(mats));
        that.mesh = new THREE.Mesh( geom, new THREE.MeshPhongMaterial( { ambient: color & 0x999999, color: color } ) );
        that.mesh.useQuaternion = true;
        that.mesh.position = posBase.clone();
        that.mesh.castShadow = true;
        //that.mesh.receiveShadow = true;
        that.mesh.name = "Unit";
        that.mesh.userData = that;
        scene.add(that.mesh);

        // outline
        var outlineMaterial = new THREE.MeshBasicMaterial( { color: that.color, side: THREE.BackSide } );
        that.meshOutline = new THREE.Mesh( geom, outlineMaterial );
        that.meshOutline.name = that.mesh.name + ".Outline";
    	that.meshOutline.position = that.mesh.position;
        that.meshOutline.quaternion = this.mesh.quaternion;
        that.meshOutline.useQuaternion = true;
	    that.meshOutline.scale.multiplyScalar(1.05);
	    that.meshOutline.visible = false;
	    scene.add(that.meshOutline);

        // go from base to spawn point
        this.goalPath.push(sceneMap.getSceneGraphPosition(new THREE.Vector3(posBase.x, posSpawn.y, posBase.z)));
        this.goalPath.push(sceneMap.getSceneGraphPosition(posSpawn));
    };
//    loader.load( "models/unit0.js", onGeometry );    
    this.onGeometry(new THREE.CubeGeometry( 1, 1, 1 ), null);

    this.goTo = function(point) {
        var posStart = this.sceneMap.getSceneGraphPosition(this.mesh.position);
        var posEnd = this.sceneMap.getSceneGraphPosition(point);
        if (!posEnd) {
            log("can't go there :(");
            return;
        }
    
        var start = this.sceneMap.pathGraph.nodes[posStart.x][posStart.y];
        var end = this.sceneMap.pathGraph.nodes[posEnd.x][posEnd.y];
        this.goalPath = astar.search(this.sceneMap.pathGraph.nodes, start, end, true);
        this.goalCurrent = 0;
        //log(this.goalPath);
        //for (var i in this.goalPath)
        //    drawBoundingBox(scenePathGraphBoxes[this.goalPath[i].x][this.goalPath[i].y], 0x0000aa, "debug");  // debug          
    };

    this.select = function(flag)
    {
        this.meshOutline.visible = flag;      
    };

    this.update = function(dt) {
        if (!this.mesh) return;
        //var dTheta = dt * this.rotSpeed;
        //lookTowards(this.mesh, this.goal, dTheta);
        if (this.goalPath && this.goalPath.length) {   
            var currentNode = this.goalPath[this.goalCurrent];  
            //log(currentNode);       
            var currentPoint = sceneMap.pathGraphBoxes[currentNode.x][currentNode.y].center();
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
                else  {
                    this.goalPath = null;
                    this.goalCurrent = 0;
                }
            }
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
}
