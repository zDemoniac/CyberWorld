function  AI(player)
{
    this.player = player;
    this.addUnit = function() {
        player.selectedBase = player.bases[0];
        player.addUnit(100, 0xff0000, scene, sceneMap);
    };

    this.update = function(deltaTime) {
        if (player.energy > 10) this.addUnit();
    };
}
