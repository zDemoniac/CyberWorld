function Player(startEnergy, baseName)
{
    this.energy = startEnergy;
    this.energyGenerationSpeed = 0.1;

    this.baseName = baseName;

    this.selectedObject = null;
    this.selectedBase = null;

    this.bases = [];
    this.units = [];

    var loader = new THREE.JSONLoader();

    this.addBase = function(unitSpawnPosition, mesh) {
        var base = new Base(unitSpawnPosition, mesh);
        this.bases.push(base);
        return base;
    };

    this.addUnit = function(health, scene, sceneMap) {
        this.units.push(new Unit0(health, scene, 
                                  this.selectedBase.mesh.position, 
                                  this.selectedBase.unitSpawnPosition, loader, sceneMap));
    };

    this.goUnit = function(point) {
        for ( var i = 0; i < this.units.length; i++) {
            if (this.units[i].mesh.position == this.selectedObject.position)
                this.units[i].goTo(new THREE.Vector3(point.x, player.units[i].mesh.position.y, point.z));
        }
    };

    this.deselectAll = function()
    {
        var i;
        for (i = 0; i < this.units.length; i++) this.units[i].select(false);
        for (i = 0; i < this.bases.length; i++) this.bases[i].select(false);
    };
    
    this.update = function(dt) {
        // generate energy
        this.energy += this.energyGenerationSpeed * dt;
        var i;
        for (i = 0; i < this.units.length; i++) this.units[i].update(dt);
    };
}
