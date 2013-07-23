function log(text) {
    console.log(text);
}

function computeBoundingBox(mesh)
{
    mesh.geometry.boundingBox = new THREE.Box3();
    
    if ( mesh.geometry.vertices.length > 0 ) {

			var point = mesh.geometry.vertices[ 0 ].clone();
            flipYZ(point);
            point.add(mesh.position);

			mesh.geometry.boundingBox.min.copy( point );
			mesh.geometry.boundingBox.max.copy( point );

			for ( var i = 1, il = mesh.geometry.vertices.length; i < il; i ++ ) {

                point = mesh.geometry.vertices[i].clone();
                flipYZ(point);
                point.add(mesh.position);

				if ( point.x < mesh.geometry.boundingBox.min.x ) {

					mesh.geometry.boundingBox.min.x = point.x;

				} else if ( point.x > mesh.geometry.boundingBox.max.x ) {

					mesh.geometry.boundingBox.max.x = point.x;

				}

				if ( point.y < mesh.geometry.boundingBox.min.y ) {

					mesh.geometry.boundingBox.min.y = point.y;

				} else if ( point.y > mesh.geometry.boundingBox.max.y ) {

					mesh.geometry.boundingBox.max.y = point.y;

				}

				if ( point.z < mesh.geometry.boundingBox.min.z ) {

					mesh.geometry.boundingBox.min.z = point.z;

				} else if ( point.z > mesh.geometry.boundingBox.max.z ) {

					mesh.geometry.boundingBox.max.z = point.z;

				}

			}

		} else {

			mesh.geometry.boundingBox.makeEmpty();

		}  
}

function drawBoundingBox(box, color, name) {
    //log(box);
    var length = (box.max.x - box.min.x) + 0.1;
    var height = (box.max.y - box.min.y) + 0.1;
    var depth =  (box.max.z - box.min.z) + 0.1;
    //log(length);
    //log(height);
    //log(depth);

    var boundingBoxGeometry = new THREE.CubeGeometry( length, height, Math.abs(depth) );
    for ( var i = 0; i < boundingBoxGeometry.faces.length; i ++ ) {
        boundingBoxGeometry.faces[i].color.setHex( !color ? Math.random() * 0xffffff : color);
    }
    var boundingBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, vertexColors: THREE.FaceColors, transparent: true, opacity: 0.7 } );
    var boundingBoxMesh = new THREE.Mesh( boundingBoxGeometry, boundingBoxMaterial);
    var position = box.center();
    boundingBoxMesh.translateX(position.x);
    boundingBoxMesh.translateY(position.y);
    boundingBoxMesh.translateZ(position.z);
    if (name) boundingBoxMesh.name = name;
    scene.add(boundingBoxMesh);
    box.userData = boundingBoxMesh;
}

function flipYZ(v)
{
    var tmp = v.z;   
    v.z = -v.y;
    v.y = tmp;
}

function calc2Dpoint(object, camera, renderer) {

	var widthHalf = renderer.domElement.width/2;
	var heightHalf = renderer.domElement.height/2;
	
	var vector = new THREE.Vector3();
	var projector = new THREE.Projector();
	projector.projectVector( vector.getPositionFromMatrix( object.matrixWorld ), camera );
	
	vector.x = ( vector.x * widthHalf ) + widthHalf;
	vector.y = - ( vector.y * heightHalf ) + heightHalf;

    return vector;

}

var argv = function () {
    // This function is anonymous, is executed immediately and
    // the return value is assigned to QueryString!
    var query_string = {};
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof query_string[pair[0]] === "undefined") {
            query_string[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof query_string[pair[0]] === "string") {
            var arr = [ query_string[pair[0]], pair[1] ];
            query_string[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            query_string[pair[0]].push(pair[1]);
        }
    }
    return query_string;
} ();

// Array Remove - By John Resig (MIT Licensed)
//Array.prototype.remove = function(from, to) {
//    var rest = this.slice((to || from) + 1 || this.length);
//    this.length = from < 0 ? this.length + from : from;
//    return this.push.apply(this, rest);
//};
