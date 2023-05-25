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
var righArm, leftArm;

var leg, legs, feet;

var angcab = Math.PI / 16,
  maxRotationCabX = Math.PI / 2,
  minRotationCabX = 0,
  maxRotationPernaX = Math.PI / 4,
  minRotationPernaX = -Math.PI / 2,
  minRotationPesX = -Math.PI / 2,
  maxRotationPesX = 0
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

var rotcabfrente = false,
  rotpernafrente = false,
  rotpernatras = false,
  rotcabtras = false,
  rotpesfrente = false,
  rotpestras = false,
  latBraco = false,
  medBraco = false;

var geometry,
  material = [],
  mesh;

var keys = {};

var direita = false,
  esquerda = false,
  frente = false,
  tras = false;

var vel = 1,
  trailer_x,
  trailer_z;



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
  //createTrailer(0, 0, 15);
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
  geometry = new THREE.BoxGeometry(5, 5, 13);
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
  addWheel(trailer,  2, -3.5,  4.5);
  addWheel(trailer, -2, -3.5,  4.5);
  // Rodas da Frente
  addWheel(trailer,  2, -3.5, 2.25);
  addWheel(trailer, -2, -3.5, 2.25);

  addTrailerConnector(trailer, 0, -2.75, -3.5);

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

  addWheel(upperBody,   3,  -4, 0);
  addWheel(upperBody,  -3,  -4, 0);

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
  
  addFoot(feet, 1.25, 0, -0.25);
  addFoot(feet, -1.5, 0, -0.25);
  
  feet.position.set(x, y, z);
  obj.add(feet);
}

////      ////
//// Feet ////
////      ////

function addLegs(obj, x, y, z) {
  legs = new THREE.Group();
  
  addRightLeg(legs, 1.25,    0,     0);
  
  addLeftLeg(legs, -1.25,    0,     0);
  
  addFeet(legs,        0, -6.5,     0);
  
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
  
  addLegs(robot,        0,   -5.5,  0);
  
  robot.position.set(x, y, z);

  scene.add(robot);
}

////       ////
//// ROBOT ////
////       ////

function isCamiao() {
  // if (head.rotation.x == maxRotationCabX &&
  //     leftArm.position.x == minCoord &&
  //     )
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
  "use strict";

  // Centroide do Camiao
  const centroideCamiao = new THREE.Vector3(0, 0, 2.5);

  // Centroide do Reboque
  const centroideReboque = new THREE.Vector3(trailer.position.x, 0,trailer.position.z);
  console.log(trailer.children)

  // Verificar se colidem em X
  console.log(Math.abs(centroideCamiao.x - centroideReboque.x))
  console.log(Math.abs(centroideCamiao.z - centroideReboque.z))
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
}

////////////
/* UPDATE */
////////////
function update() {
  "use strict";
  // Usar delta time do js nativo
  /*
  if (isCamiao()) {
    if (checkCollisions()) {
      handleCollisions();
    }
  }
  console.log(checkCollisions())
  */
  // questao -> podemos usar Box3 ou temos que implementar as nossas AABB boxes?
  // "Custom" funcao para verificar colisoes
  // console.log(checkCollisions(trailerBox, robotBox));
  // Verifica se há colisão mas só o deve fazer quando o Robot está em modo Camião
  // Boolean que verica se as pecas todas do robot estao para dentro?
  // Quando detetamos a colisao calculamos a diferenca entre a posicao do centro do trailer e a posicao onde tem que ficar no fim da
  // animacao e depois em cada ciclo do update mudamos a posicao do trailer e retornamos logo para nao podermos mexer em nada
  // isto acontece ate chegarmos a posicao que queremos
  
  if ((direita || esquerda || frente || tras) && !lock) {
    trailer_x = 0;
    trailer_z = 0;

    if (direita == true) {
      trailer_x += 0.1;
      direita = false;
    }

    if (esquerda == true) {
      trailer_x -= 0.1;
      esquerda = false;
    }

    if (frente == true) {
      trailer_z += 0.1;
      frente = false;
    }

    if (tras == true) {
      trailer_z -= 0.1;
      tras = false;
    }

    if (trailer_x != 0 && trailer_z != 0) {

      trailer.position.x += trailer_x * (Math.sqrt(2) / 2);
      trailer.position.z += trailer_z * (Math.sqrt(2) / 2);
    } else {

      trailer.position.x += trailer_x * vel;
      trailer.position.z += trailer_z * vel;
    }
  } else if (rotcabfrente == true || rotcabtras == true) {
    if (rotcabfrente == true && head.rotation.x > minRotationCabX) {
      head.rotation.x -= angcab;
    } else if (rotcabtras == true && head.rotation.x < maxRotationCabX) {
      head.rotation.x += angcab;
    }
    rotcabtras = false;
    rotcabfrente = false;
  } else if (latBraco == true || medBraco == true) {
    if (latBraco == true && leftArm.position.x <= maxCoord) {
      rightArm.position.x -= 0.1;
      leftArm.position.x += 0.1;
    } else if (medBraco == true && leftArm.position.x >= minCoord) {
      rightArm.position.x += 0.1;
      leftArm.position.x -= 0.1;
    }
    latBraco = false;
    medBraco = false;
  } else if (rotpesfrente == true || rotpestras == true) {
    if (rotpesfrente == true && feet.rotation.x > minRotationPesX) {
      feet.rotation.x -= angcab;
    } else if (rotpestras == true && feet.rotation.x < maxRotationPesX) {
      feet.rotation.x += angcab;
    }
    rotpesfrente = false;
    rotpestras = false;
  
  } else if (wirestate == true) {
    materialred.wireframe = !materialred.wireframe;
    materialblue.wireframe = !materialblue.wireframe;
    materialgreen.wireframe = !materialgreen.wireframe;
    materialblack.wireframe = !materialblack.wireframe;
    wirestate = false;
  } else if (rotpernafrente == true || rotpernatras == true) {
    if (rotpernafrente == true && legs.rotation.x > minRotationPernaX) {
      legs.rotation.x -= angcab;
    } else if (rotpernatras == true && legs.rotation.x < maxRotationPernaX) {
      legs.rotation.x += angcab;
    }
    rotpernafrente = false;
    rotpernatras = false;
  } else {
    handleKeyUp;
  }

  
  
  //robotBox.setFromObject(robot)
  //trailerBox.setFromObject(trailer)
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
  camera_index = 1;

  render(cameras[camera_index]);

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  "use strict";

  // Criar THREE.Clock

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

///////////////////////
/* KEY DOWN CALLBACK */
///////////////////////
function onKeyDown() {
  "use strict";
  //-------trailer movement-------
  switch (true) {
    case keys[38] && keys[39]: //ArrowUp and ArrowRight
      frente = true;
      direita = true;
      break;

    case keys[38] && keys[37]: //ArrowUp and ArrowLeft
      frente = true;
      esquerda = true;
      break;

    case keys[40] && keys[39]: //ArrowDown and ArrowRight
      tras = true;
      direita = true;
      break;

    case keys[40] && keys[37]: //ArrowDown and ArrowLeft
      tras = true;
      esquerda = true;
      break;

    case keys[37]: //ArrowLeft
      esquerda = true;
      break;

    case keys[39]: //ArrowRight
      direita = true;
      break;

    case keys[40]: //ArrowDown
      tras = true;
      break;

    case keys[38]: //ArrowUp
      frente = true;
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
    //-----rotation----------
    case keys[82]: //R(r)
      rotcabfrente = true;
      break;

    case keys[70]: //F(f)
      rotcabtras = true;
      break;

    case keys[87]: //W(w)
      rotpernafrente = true;
      break;

    case keys[83]: //S(s)
      rotpernatras = true;
      break;

    case keys[68]: //D(d)
      latBraco = true;
      break;

    case keys[69]: //E(e)
      medBraco = true;
      break;

    case keys[65]: //A(a)
      rotpestras = true;
      break;
    
    case keys[81]: //Q(q)
      rotpesfrente = true;
      break; 
  }
}

///////////////////////
/* KEY UP CALLBACK */
///////////////////////
/*function onKeyUp(e){
    'use strict';

}*/
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







/*
 Centroide Camiao (0, 0, 2.5)

Tamanho 4.5 -> x
        5.5 -> z


  Centroide do Reboque (trailer.position.x, 0, trailer.position.y)

  tamanho x -> 2.5
          z -> 6.5


*/