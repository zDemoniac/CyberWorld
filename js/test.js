function addTestCubes() {
    var geometry = new THREE.CubeGeometry( 1, 1, 1 );

    for ( var i = 0; i < 10; i ++ ) {

        var object = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { color: Math.random() * 0xffffff, opacity: 0.5 } ) );
        object.position.x = Math.random() * 20 - 10;
        object.position.y = Math.random() * 20 - 10;
        object.position.z = Math.random() * 20 - 10;

        object.scale.x = Math.random() * 2 + 1;
        object.scale.y = Math.random() * 2 + 1;
        object.scale.z = Math.random() * 2 + 1;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;
        object.name = "Cube"+i;

        scene.add( object );

        //objects.push( object );
    }

    var PI2 = Math.PI * 2;
    particleMaterial = new THREE.ParticleCanvasMaterial( {
        color: 0x000000,
        program: function ( context ) {
            context.beginPath();
            context.arc( 0, 0, 1, 0, PI2, true );
            context.closePath();
            context.fill();

        }
    } );
}
