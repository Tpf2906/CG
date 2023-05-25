//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cameras = [];
var cameraX, cameraY, cameraZ, perspectiveCamera, orthographicCamera;
var camera_index;
var scene, renderer;

var trailer;
var robot;
var upperBody;
var head;
var rightArm, leftArm;
var leg, legs, feet;

var time, delta;

var reset = false;

var velRotation = Math.PI / 4,
  maxHeadRotation = Math.PI / 2,
  minHeadRotation = 0,
  maxLegRotation = Math.PI / 4,
  minLegRotation = -Math.PI / 2,
  minFootRotation = -Math.PI / 2,
  maxFootRotation = 0
  maxCoord = 4.9,
  minCoord = 3.1;

var lock = false;

var materialred = new THREE.MeshBasicMaterial({
  color: 0xff0000,
  wireframe: true,
});
var materialgreen = new THREE.MeshBasicMaterial({
  color: 0x00ff00,
  wireframe: true,
});
var materialblue = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  wireframe: true,
});
var materialblack = new THREE.MeshBasicMaterial({
  color: 0x000000,
  wireframe: true,
});

var wirestate = false;

var headForwardRotation = false,
  legForwardRotation = false,
  legBackRotation = false,
  headBackRotation = false,
  footForwardRotation = false,
  footBackRotation = false,
  armLat = false,
  armMed = false;

var geometry,
  material = [],
  mesh;

var keys = {};

var moveRight = false,
    moveLeft = false,
    moveForward = false,
    moveBack = false;

var trailerVel = 7.5, trailer_x = 0, trailer_z = 0;
var velArm = 3;

// Centroide do Camiao
const centroideCamiao = new THREE.Vector3(0, 0, 2.5);

// Centroide do Reboque
var centroideReboque;


/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
  "use strict";

  scene = new THREE.Scene();
  
  scene.add(new THREE.AxisHelper(10));
  
  // Background
  scene.background = new THREE.Color(0xa9f5ee);

  // Create the Robot at (0,0,0)
  createRobot(0, 0, 0);
  // Create the Trailer at (0,0,15)
  createTrailer(0, -0.9, 15);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
  "use strict";

  // Camera Frontal
  // Create a camera aligned with the Z axis
  const cameraZ = new THREE.OrthographicCamera(
    window.innerWidth / -40,
    window.innerWidth / 40,
    window.innerHeight / 40,
    window.innerHeight / -40,
    1,
    1000
  );
  cameraZ.position.set(0, 0, -30);
  cameraZ.lookAt(scene.position);

  cameras.push(cameraZ);
  scene.add(cameraZ);
  
  // Camera Lateral
  // Create a camera aligned with the X axis
  const cameraX = new THREE.OrthographicCamera(
    window.innerWidth / -40,
    window.innerWidth / 40,
    window.innerHeight / 40,
    window.innerHeight / -40,
    1,
    1000
  );
  cameraX.position.set(30, 0, 0);
  cameraX.lookAt(scene.position);

  cameras.push(cameraX);
  scene.add(cameraX);
  
  // Camera Topo
  // Create a camera aligned with the Y axis
  const cameraY = new THREE.OrthographicCamera(
    window.innerWidth / -40,
    window.innerWidth / 40,
    window.innerHeight / -40,
    window.innerHeight / 40,
    1,
    1000
  );
  cameraY.position.set(0, 30, 0);
  cameraY.lookAt(scene.position);

  cameras.push(cameraY);
  scene.add(cameraY);

  // Perspetiva Isometrica
  // Create an orthographic camera
  const aspectRatio = window.innerWidth / window.innerHeight;
  const orthographicCamera = new THREE.OrthographicCamera(
    -30 * aspectRatio,
    30 * aspectRatio,
    30,
    -30,
    1,
    1000
  );
  orthographicCamera.position.set(20, 20, 20);
  orthographicCamera.lookAt(scene.position);
  
  cameras.push(orthographicCamera);
  scene.add(orthographicCamera);

  // Perspetiva Isometrica
  // Create a perspective camera
  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  perspectiveCamera.position.set(20, 20, 20);
  perspectiveCamera.lookAt(scene.position);
  
  cameras.push(perspectiveCamera);
  scene.add(perspectiveCamera);

}

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////

////      ////
//// RODA ////
////      ////

function addWheel(obj, x, y, z) {
  geometry = new THREE.CylinderGeometry(1, 1, 1.5, 32);
  mesh = new THREE.Mesh(geometry, materialblack);
  mesh.rotation.z += Math.PI / 2;
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

////      ////
//// RODA ////
////      ////

////         ////  
//// TRAILER ////
////         ////

function addTrailerBox(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(8, 5, 13);
  mesh = new THREE.Mesh(geometry, materialgreen);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addTrailerConnector(obj, x, y, z) {
  geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
  mesh = new THREE.Mesh(geometry, materialred);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function createTrailer(x, y, z) {
  "use strict";

  trailer = new THREE.Object3D();

  addTrailerBox(trailer, 0, 0, 0);

  // Rodas de Tras
  addWheel(trailer,  3, -3.5,  4.5);
  addWheel(trailer, -3, -3.5,  4.5);
  // Rodas da Frente
  addWheel(trailer,  3, -3.5, 2.25);
  addWheel(trailer, -3, -3.5, 2.25);

  addTrailerConnector(trailer, 0, -2.75, -4.5);

  trailer.position.set(x, y, z);
  
  scene.add(trailer);
}

////         ////  
//// TRAILER ////
////         ////

////       ////
//// ROBOT ////
////       ////

////            ////
//// Upper Body ////
////            ////

function addChest(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(8, 3, 6);
  mesh = new THREE.Mesh(geometry, materialred);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addAbdomen(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(4, 2, 6);
  mesh = new THREE.Mesh(geometry, materialblue);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addWaist(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(4.5, 1, 6);
  mesh = new THREE.Mesh(geometry, materialred);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addUpperBody(obj, x, y, z) {
  upperBody = new THREE.Group();

  addChest(upperBody,   0,   0, 0);

  addAbdomen(upperBody, 0,-2.5, 0);

  addWaist(upperBody,   0,  -4, 0);

  addWheel(upperBody,   3,  -4.5, 0);
  addWheel(upperBody,  -3,  -4.5, 0);

  upperBody.position.set(x, y, z);

  obj.add(upperBody);
}

////            ////
//// Upper Body ////
////            ////

////      ////
//// Head ////
////      ////

function addSkull(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(2, 2, 2);
  mesh = new THREE.Mesh(geometry, materialgreen);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addEye(obj, x, y, z) {
  geometry = new THREE.CylinderGeometry(0.3, 0.3, 0.5, 32);
  mesh = new THREE.Mesh(geometry, materialblue);
  mesh.rotation.x += Math.PI / 2;
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addAntena(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(0.1, 1, 0.5);
  mesh = new THREE.Mesh(geometry, materialred);
  mesh.position.set(x, y, z);
  obj.add(mesh)
}

function addHead(obj, x, y, z) {
  head = new THREE.Group();

  addSkull(head,    0,   1, 1);
  
  addEye(head,    0.5, 1.5, 0);
  addEye(head,   -0.5, 1.5, 0);
  
  addAntena(head,   1,   2, 1);
  addAntena(head,  -1,   2, 1);
  
  head.position.set(x, y, z);
  
  obj.add(head);
}

////      ////
//// Head ////
////      ////

////     ////
//// Arm ////
////     ////

function addArm(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(2, 3, 2);
  mesh = new THREE.Mesh(geometry, materialblue);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addForearm(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(2, 2, 6);
  mesh = new THREE.Mesh(geometry, materialgreen);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addEscape(obj, x, y, z) {
  geometry = new THREE.CylinderGeometry(0.25, 0.25, 4, 32);
  mesh = new THREE.Mesh(geometry, materialred);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addRightArm(obj, x, y, z) {
  rightArm = new THREE.Group();

  addArm(rightArm,        0,    0,  0);
  addForearm(rightArm,    0, -2.5, -2);
  addEscape(rightArm,  1.25,    1,  0);
  
  rightArm.position.set(x, y, z);
  
  obj.add(rightArm);
}

function addLeftArm(obj, x, y, z) {
  leftArm = new THREE.Group();

  addArm(leftArm,        0,    0,  0);
  addForearm(leftArm,    0, -2.5, -2);
  addEscape(leftArm, -1.25,    1,  0);

  leftArm.position.set(x, y, z);

  obj.add(leftArm);
}

////     ////
//// Arm ////
////     ////

////      ////
//// Legs ////
////      ////

function addThigh(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(1, 2, 1);
  mesh = new THREE.Mesh(geometry, materialred);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addCanela(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(2, 5, 1.5);
  mesh = new THREE.Mesh(geometry, materialblue);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addRightLeg(obj, x, y, z) {
  leg = new THREE.Group();

  addThigh(leg,  0,       0, 0);
  addCanela(leg, 0,    -3.5, 0);
  
  addWheel(leg, 1.75, -2.75, 0);
  addWheel(leg, 1.75,    -5, 0);
  
  leg.position.set(x, y, z);

  obj.add(leg);
}

function addLeftLeg(obj, x, y, z) {
  leg = new THREE.Group();

  addThigh(leg,   0,       0, 0);
  addCanela(leg,  0,    -3.5, 0);
  
  addWheel(leg, -1.75, -2.75, 0);
  addWheel(leg, -1.75,    -5, 0);

  leg.position.set(x, y, z);

  obj.add(leg);
}

////      ////
//// Feet ////
////      ////

function addFoot(obj,x,y,z){
  geometry = new THREE.BoxGeometry(2, 1, 2);
  mesh = new THREE.Mesh(geometry,materialgreen);
  mesh.position.set(x,y,z);
  obj.add(mesh);
}

function addFeet(obj, x, y, z) {
  feet = new THREE.Group();
  
  addFoot(feet, 1.25, -0.5, 0);
  addFoot(feet, -1.25, -0.5, 0);
  
  feet.position.set(x, y, z);
  obj.add(feet);
}

////      ////
//// Feet ////
////      ////

function addLegs(obj, x, y, z) {
  legs = new THREE.Group();
  
  addRightLeg(legs, 1.25,   -1,      0);
  
  addLeftLeg(legs, -1.25,   -1,      0);
  
  addFeet(legs,        0,   -7,  -0.25);
  
  legs.position.set(x, y, z);
  
  obj.add(legs);
}

////      ////
//// Legs ////
////      ////

function createRobot(x, y, z) {
  "use strict";

  robot = new THREE.Object3D();

  addUpperBody(robot, 0,   0,  0);
  
  addHead(robot,      0, 1.5, -1);
  
  addRightArm(robot,  5,   0,  2);
  addLeftArm(robot,  -5,   0,  2);
  
  addLegs(robot,        0,   -4.5,  0);
  
  robot.position.set(x, y, z);

  scene.add(robot);
}

////       ////
//// ROBOT ////
////       ////

function isCamiao() {

  if (Math.abs(head.rotation.x - maxHeadRotation) < 0.1) {
    if (Math.abs(rightArm.position.x - minCoord) < 0.1) {
      if (Math.abs(legs.rotation.x - minLegRotation) < 0.1) {
        if (Math.abs(feet.rotation.x - minFootRotation) < 0.1) {
          return true;
        }
      }
    }
  }

  return false;
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
  "use strict";

  // Centroide do Reboque
  centroideReboque = new THREE.Vector3(trailer.position.x, 0,trailer.position.z);
  

  // Verificar se colidem em X
  if ((Math.abs(centroideCamiao.x - centroideReboque.x) <= 7) &&
      (Math.abs(centroideCamiao.z - centroideReboque.z) <= 12)) {
        lock = true;
        return true;
  }
  return false;

}

///////////////////////
/* HANDLE COLLISIONS */
///////////////////////
function handleCollisions() {
  "use strict";

  var posFinal = new THREE.Vector3(0, 0, 10);

  var deltaX = posFinal.x - centroideReboque.x;
  var deltaZ = posFinal.z - centroideReboque.z;
  
  if (Math.abs(deltaX) < 0.01 && Math.abs(deltaZ) < 0.01) {
    return;
  }

  trailer.position.x += deltaX * delta;
  trailer.position.z += deltaZ * delta;

}

////////////
/* UPDATE */
////////////
function update() {
  "use strict";
  
  if (isCamiao()) {
    if (checkCollisions()) {
      handleCollisions();
    }
  }
  
  if ((moveRight || moveLeft || moveForward || moveBack) && !lock) {

    trailer_x = 0;
    trailer_z = 0;

    if (moveRight) {
        trailer_x += 1;
        moveRight = false;
      } 

    if (moveLeft) {
        trailer_x += -1
        moveLeft = false;
      }

    if (moveForward) {
        trailer_z += -1;
        moveForward = false;
      }

    if (moveBack) {
        trailer_z += 1;
        moveBack = false;
      }
  
    if (trailer_x != 0 && trailer_z != 0) {

      trailer.position.x += trailer_x * ((trailerVel/Math.sqrt(2)) * delta); 
      trailer.position.z += trailer_z * ((trailerVel/Math.sqrt(2)) * delta);
    
    } else {
      trailer.position.x += trailer_x * trailerVel * delta;
      trailer.position.z += trailer_z * trailerVel * delta;
    }
  } else if (headForwardRotation == true || headBackRotation == true) {

    if (headForwardRotation == true && head.rotation.x > minHeadRotation) {
      head.rotation.x -= velRotation * delta;
    } else if (headBackRotation == true && head.rotation.x < maxHeadRotation) {
      head.rotation.x += velRotation * delta;
    }

    headBackRotation = false;
    headForwardRotation = false;

  } else if (armLat == true || armMed == true) {

    if (armLat == true && rightArm.position.x <= maxCoord) {
      rightArm.position.x += velArm * delta;
      leftArm.position.x -= velArm * delta;
    } else if (armMed == true && rightArm.position.x >= minCoord) {
      rightArm.position.x -= velArm * delta;
      leftArm.position.x += velArm * delta;
    }

    armLat = false;
    armMed = false;

  } else if (footForwardRotation == true || footBackRotation == true) {

    if (footForwardRotation == true && feet.rotation.x > minFootRotation) {
      feet.rotation.x -= velRotation * delta;
    } else if (footBackRotation == true && feet.rotation.x < maxFootRotation) {
      feet.rotation.x += velRotation * delta;
    }

    footForwardRotation = false;
    footBackRotation = false;
  
  } else if (wirestate == true) {
    materialred.wireframe = !materialred.wireframe;
    materialblue.wireframe = !materialblue.wireframe;
    materialgreen.wireframe = !materialgreen.wireframe;
    materialblack.wireframe = !materialblack.wireframe;
    wirestate = false;
  } else if (legForwardRotation == true || legBackRotation == true) {

    if (legForwardRotation == true && legs.rotation.x > minLegRotation) {
      legs.rotation.x -= velRotation * delta;
    } else if (legBackRotation == true && legs.rotation.x < maxLegRotation) {
      legs.rotation.x += velRotation * delta;
    }

    legForwardRotation = false;
    legBackRotation = false;

  } else if (reset) {
    trailer.position.set(0, 0, 15);
    lock = false;
    reset = false;
  } else {
    handleKeyUp;
  }

}

/////////////
/* DISPLAY */
/////////////
function render(camera) {
  "use strict";
  renderer.render(scene, camera);
}

////////////////////////////////
/* INITIALIZE ANIMATION CYCLE */
////////////////////////////////
function init() {
  "use strict";
  renderer = new THREE.WebGLRenderer({
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  createScene();
  createCamera();
  camera_index = 4;

  render(cameras[camera_index]);

  time = new THREE.Clock();

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  "use strict";

  delta = time.getDelta()

  update();

  render(cameras[camera_index]);

  requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
  "use strict";

  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerHeight > 0 && window.innerWidth > 0) {
    for (var i = 0; i < cameras.length; i++) {
      cameras[i].aspect = window.innerWidth / window.innerHeight;
      cameras[i].updateProjectionMatrix();
    }
  }
}

////////////////////////
/* KEY PRESS CALLBACK */
////////////////////////

function onKeyDown() {
  "use strict";

  switch (true) {
    //-------TRAILER MOVEMENT-------//
    case keys[38] && keys[39]: //ArrowUp and ArrowRight
      moveForward = true;
      moveRight = true;
      break;

    case keys[38] && keys[37]: //ArrowUp and ArrowLeft
      moveForward = true;
      moveLeft = true;
      break;

    case keys[40] && keys[39]: //ArrowDown and ArrowRight
      moveBack = true;
      moveRight = true;
      break;

    case keys[40] && keys[37]: //ArrowDown and ArrowLeft
      moveBack = true;
      moveLeft = true;
      break;
    case keys[37]: //ArrowLeft
      moveLeft = true;
      break;

    case keys[39]: //ArrowRight
      moveRight = true;
      break;

    case keys[40]: //ArrowDown
      moveBack = true;
      break;

    case keys[38]: //ArrowUp
      moveForward = true;
      break;


    //-------camera-------
    case keys[49]: //Digit1
      camera_index = 0;
      break;

    case keys[50]: //Digit2
      camera_index = 1;
      break;

    case keys[51]: //Digit3
      camera_index = 2;
      break;

    case keys[52]: //Digit4
      camera_index = 3;
      break;

    case keys[53]: //Digit5
      camera_index = 4;
      break;

    case keys[54]: //Digit6
      wirestate = true;
      break;
    case keys[55]: //Digit7
      reset = true;
      break;
    //-----rotation----------
    case keys[82]: //R(r)
      headForwardRotation = true;
      break;

    case keys[70]: //F(f)
      headBackRotation = true;
      break;

    case keys[87]: //W(w)
      legForwardRotation = true;
      break;

    case keys[83]: //S(s)
      legBackRotation = true;
      break;

    case keys[68]: //D(d)
      armLat = true;
      break;

    case keys[69]: //E(e)
      armMed = true;
      break;

    case keys[65]: //A(a)
      footBackRotation = true;
      break;
    
    case keys[81]: //Q(q)
      footForwardRotation = true;
      break; 
  }
}

function handleKeyDown(event) {
  var keyCode = event.keyCode;
  keys[keyCode] = true;
  onKeyDown();
}

function handleKeyUp(event) {
  var keyCode = event.keyCode;
  keys[keyCode] = false;
  onKeyDown();
}
