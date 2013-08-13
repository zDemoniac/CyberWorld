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

	this.parts = { 	"chassis1": {price: 2, health: 50},
					"chassis2": {price: 3, health: 75},
				   	"torso1": {price: 3, health: 100},
				   	"torso2": {price: 5, health: 150},
					"gun1": {price: 2, health: 10},
					"gun2": {price: 4, health: 20}};
}
