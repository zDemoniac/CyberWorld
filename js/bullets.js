function  Bullet(damage, rangeSq, reloadSec, color, scene)
{
	this.goal = new THREE.Vector3();
	this.color = color;
	this.speed = 10;
    this.reload = reloadSec*1000;
	this.damageMin = damage[0];
	this.damageMax = damage[1];
    this.fireRangeSq = rangeSq; // fire range squared
	this.target = null;

	var that = this;

	this.clean = function() {
		scene.remove(this.mesh);
	};

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
        if (this.mesh.visible) return; // already firing
        if (position.distanceToSquared(target.body.position) > this.fireRangeSq) return; // far

		this.mesh.visible = true;
		this.mesh.position = position.clone();
		this.target = target;
	};

	this.update = function(dt) {
        if (!this.mesh || !this.mesh.visible) return;
		var goal = this.target.body.position;

        this.mesh.lookAt(goal);
		if (this.mesh.position.distanceToSquared(goal) > .1) {
			var moveDist = dt * this.speed;
			this.mesh.translateZ(moveDist);
			if(this.target.health <= 1) this.mesh.visible = false;
        }
		else {
			this.mesh.visible = false;
			// do damage
			var dmg = Math.random()*(this.damageMax - this.damageMin) + this.damageMin;
			this.target.health -= dmg;
			this.target.updateHealth();
			//log("damaged by: " + Math.round(dmg));
        }
	};
}
