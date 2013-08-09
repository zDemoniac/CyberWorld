function  Base(unitSpawnPosition, mesh, scene, color)
{
    this.mesh = mesh;
    this.unitSpawnPosition = unitSpawnPosition;

    // outline
    var outlineMaterial = new THREE.MeshBasicMaterial( { color: color, side: THREE.BackSide } );
    this.meshOutline = new THREE.Mesh( mesh.geometry, outlineMaterial );
    this.meshOutline.name = this.mesh.name + ".Outline";
    this.meshOutline.position = this.mesh.position;
    this.meshOutline.quaternion = this.mesh.quaternion;
	this.meshOutline.scale.multiplyScalar(1.02);
	this.meshOutline.visible = false;
	scene.add(this.meshOutline);

    this.select = function(flag)
    {
        this.meshOutline.visible = flag;      
    };

    this.getPartPrice = function(name) {
        switch (name) {
            case "chassis1": return 2; break;
            case "torso1": return 3;  break;
            case "gun1": return 1;  break;
            default : log("no price for"+name); break;
        }
    };

    this.getPartHealth = function(name) {
        switch (name) {
            case "chassis1": return 50; break;
            case "torso1": return 100;  break;
            case "gun1": return 10;  break;
            default : log("no health for"+name); break;
        }
    };
}
