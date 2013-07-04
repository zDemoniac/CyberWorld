
function Unit0(scene,loc,loader) {
    this.rotSpeed = 1.0;
    this.speed = 2.5;
    this.closeEnough = 0.9;
    this.goal = loc;
    this.dx = new THREE.Vector3();
    this.caster = new THREE.Raycaster();
    this.caster.far = 2;
    var that = this;
    this.onGeometry = function(geom, mats) {
//        that.mesh = new THREE.Mesh( geom, new THREE.MeshFaceMaterial(mats));
        that.mesh.useQuaternion = true;
        that.mesh.position = loc.clone();
        that.mesh.castShadow = true;
        //that.mesh.receiveShadow = true;
        that.mesh.name = "Unit";
        scene.add(that.mesh);
    };
//    loader.load( "models/unit0.js", onGeometry );
    this.mesh = new THREE.Mesh( new THREE.CubeGeometry( 1, 1, 1 ), //new THREE.MeshBasicMaterial({ color: 0x00aa00}));
        new THREE.MeshPhongMaterial( { ambient: 0x009000, color: 0x00ff00 } ) );
    this.onGeometry(null, null);

    this.prerender = function(dt) {
        if (!this.mesh) return;
        //var dTheta = dt * this.rotSpeed;
        //lookTowards(this.mesh, this.goal, dTheta);
        this.mesh.lookAt(this.goal);
        this.dx.subVectors(this.goal, this.mesh.position);
        if (this.dx.length() > this.closeEnough) {
            var moveDist = dt * this.speed;
            this.mesh.translateZ(moveDist);
        }

        var direction = new THREE.Vector3(0,0,1).applyQuaternion(this.mesh.quaternion);

        this.caster.set(this.mesh.position, direction);

        var collisions = this.caster.intersectObjects(scene.__objects, false);
        if (collisions.length) {
            for (var i = 0; i < collisions.length; i++)
                log(collisions[i].object.name);
            this.goal = this.mesh.position;
        }
    };
}