function  Bullet(color)
{
	this.goal = new THREE.Vector3();
	this.dx = new THREE.Vector3();
	this.color = color;
	this.speed = 20;
	this.damageMin = 10;
	this.damageMax = 20;
	this.target = null;

	var that = this;
    this.onGeometry = function(geom, mats) {
//        that.mesh = new THREE.Mesh( geom, new THREE.MeshFaceMaterial(mats));
        that.mesh = new THREE.Mesh( geom, new THREE.MeshPhongMaterial( { ambient: that.color & 0xffffff, color: that.color } ) );
        that.mesh.castShadow = true;
        that.mesh.name = "Bullet";
		that.mesh.visible = false;
        scene.add(that.mesh);
    };
//    loader.load( "models/unit0.js", onGeometry );    
    this.onGeometry(new THREE.CubeGeometry( .1, .1, .4 ), null);

	this.fire = function(position, target) {
		if (this.mesh.visible) return; // allready fire

		this.mesh.visible = true;
		this.mesh.position = position.clone();
		this.target = target;
	};

	this.update = function(dt) {
        if (!this.mesh || !this.mesh.visible) return;
		var goal = this.target.mesh.position;

        this.mesh.lookAt(goal);
        this.dx.subVectors(goal, this.mesh.position);
		if (this.dx.length() > .1) {
			var moveDist = dt * this.speed;
			this.mesh.translateZ(moveDist);
        }
		else {
			this.mesh.visible = false;
			// do damage
			var dmg = Math.random()*(this.damageMax - this.damageMin) + this.damageMin;
			this.target.health -= dmg;
			//log("damaged by: " + dmg);
        }
	};
}
