
function Unit0(health, scene,loc,loader,sceneMap) {
    //this.rotSpeed = 1.0;
    this.health =  health;
    this.speed = 2.5;
    this.closeEnough = 0.4;
    this.goalPath = null;
    this.goalCurrent = 0;
    this.dx = new THREE.Vector3();
    this.sceneMap = sceneMap;
    //this.caster = new THREE.Raycaster();
    //this.caster.far = 2;
    var that = this;
    this.onGeometry = function(geom, mats) {
//        that.mesh = new THREE.Mesh( geom, new THREE.MeshFaceMaterial(mats));
        that.mesh.useQuaternion = true;
        that.mesh.position = loc.clone();
        that.mesh.castShadow = true;
        //that.mesh.receiveShadow = true;
        that.mesh.name = "Unit";
        that.mesh.userData = that;
        scene.add(that.mesh);
    };
//    loader.load( "models/unit0.js", onGeometry );
    this.mesh = new THREE.Mesh( new THREE.CubeGeometry( 1, 1, 1 ), //new THREE.MeshBasicMaterial({ color: 0x00aa00}));
        new THREE.MeshPhongMaterial( { ambient: 0x009000, color: 0x00ff00 } ) );
    this.onGeometry(null, null);

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
        //for (var i in this.goalPath)
        //    drawBoundingBox(scenePathGraphBoxes[this.goalPath[i].x][this.goalPath[i].y], 0x0000aa, "debug");  // debug          
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
                if (this.goalCurrent < this.goalPath.length-1) this.goalCurrent++;
                else this.goalPath = null;
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
