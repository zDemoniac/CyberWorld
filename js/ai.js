function  AI(computer, human)
{
    this.computer = computer;
	this.human = human;
    this.addUnit = function() {
        this.computer.addUnit(100, 0xff0000);
    };

    this.update = function(deltaTime) {
        if (this.computer.energy > this.computer.selectedBase.unitCost) this.addUnit();

		for(var i=0; i < this.computer.units.length; i++) {
			var compUnit = this.computer.units[i];
			var humUnit = this.human.units[0];
			if(!compUnit.isMoving() && humUnit) {
				var pos = humUnit.mesh.position.clone();
				pos.x += 1.5;
				compUnit.goTo(pos);
			}
		}
    };
}
