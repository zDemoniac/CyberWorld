function angleBetweenQuats(qBefore,qAfter) {
    q1 = new THREE.Quaternion();
    q1.copy(qBefore);
    q1.inverse();
    q1.multiply(qAfter);
    var halfTheta = Math.acos( q1.w );
    return 2*halfTheta;
}

function lookTowards(fromObject,toPosition, dTheta) {
    var quat0 = new THREE.Quaternion();
    quat0.setFromRotationMatrix( fromObject.matrix );
    var eye = fromObject.position;
    var center = toPosition;
    var up = new THREE.Vector3(0,1,0);
    var mat = new THREE.Matrix4();
    mat.lookAt(center,eye,up);
    var quat1 = new THREE.Quaternion();
    quat1.setFromRotationMatrix( mat );
    var deltaTheta = angleBetweenQuats(quat0,quat1);
    var frac = dTheta/deltaTheta;
    if (frac>1)  frac=1;
    fromObject.quaternion.slerp(quat1,frac);
}
