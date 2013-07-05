function SceneMap() {
    this.box = new THREE.Box3();
    this.pathGraphBoxes = [];
    this.pathGraph = null;

    this.expandBox = function(boundingBox){
        this.box.expandByPoint(boundingBox.min);
        this.box.expandByPoint(boundingBox.max);
    };

    this.getSceneGraphPosition = function(point) {
        for (var x = 0; x < this.pathGraphBoxes.length; x++) {
            for (var y = 0; y < this.pathGraphBoxes[x].length; y++) {
                if (this.pathGraphBoxes[x][y].containsPoint(point)) {
                    log("found: x="+x+" y="+y);                         // debug
                    return new THREE.Vector2(x,y);
                }
            }
        }
        return null;
    };

    this.createMapGraph = function(scene, unitSize) {
        var shift = 0.005;
        var flags = [];
        for (var x = this.box.min.x; x < this.box.max.x; x += unitSize+shift) {
            var boxes = [];
            var flagsRow = [];
            for (var z = this.box.min.z; z < this.box.max.z; z += unitSize+shift) {
                var box = new THREE.Box3();

                box.min.x = x;
                box.min.y = this.box.min.y + shift;
                box.min.z = z;

                box.max.x = x + unitSize;
                box.max.y = this.box.min.y + unitSize + shift;
                box.max.z = z + unitSize;

                boxes.push(box);

                var isIntersected = false;
                for (var i = 0; i < scene.__objects.length; i++) {
                    var obj = scene.__objects[i];
                    //log (obj.name.length);
                    if (obj instanceof THREE.Mesh && obj.name.length && obj.geometry.boundingBox.isIntersectionBox(box)) {
                        isIntersected = true;
                        break;
                    }
                }
                flagsRow.push(isIntersected ? 0 : 1);
                //drawBoundingBox(box, isIntersected ? 0xaa0000 : 0x00aa00);        // debug
            }
            this.pathGraphBoxes.push(boxes);
            flags.push(flagsRow);
        }

        this.pathGraph = new Graph(flags);
    };
}
