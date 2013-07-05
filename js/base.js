function  Base(health, unitSpawnPosition)
{
    this.health = health;
    this.healthMax = health;
    this.healthRegenerationSpeed = 0.1;

    this.unitSpawnPosition = unitSpawnPosition;
    
    this.update = function(dt) {
        // regenerate health
        if (this.health < this.healthMax) this.health += this.healthRegenerationSpeed * dt;
    };
}
