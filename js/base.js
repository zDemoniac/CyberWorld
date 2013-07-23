function  Base(unitSpawnPosition, mesh, scene, color)
{
    this.mesh = mesh;
    this.unitSpawnPosition = unitSpawnPosition;
    this.unitCost = 5;  

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
}
