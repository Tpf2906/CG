//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var cameras = [],
  cameraX,
  cameraY,
  cameraZ,
  perspectiveCamera,
  orthographicCamera,
  scene,
  renderer;

var trailer, robot, pernas, bracoDir, bracoEsq, cabeca, torco;

var angcab = Math.PI / 8,
  maxRotationX = Math.PI / 2,
  minRotationX = -Math.PI / 2,
  maxCoord = 5,
  minCoord = 3;

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

var wirestate = false;

var rotcabfrente = false,
  rotcabtras = false;

var latBraco = false,
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

var camera_index;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
  "use strict";

  scene = new THREE.Scene();

  scene.add(new THREE.AxisHelper(10));
  scene.background = new THREE.Color(0xa9f5ee);

  CreateRobo(0, 0, 0);
  CreateTrailer(0, 0, 5);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
  "use strict";
  perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  perspectiveCamera.position.set(20, 20, 20);
  perspectiveCamera.lookAt(scene.position);

  // Create an orthographic camera
  orthographicCamera = new THREE.OrthographicCamera(
    window.innerWidth / -20,
    window.innerWidth / 20,
    window.innerHeight / 20,
    window.innerHeight / -20,
    1,
    40
  );
  orthographicCamera.position.set(20, 20, 20);
  orthographicCamera.lookAt(scene.position);

  // Create a camera aligned with the X axis
  cameraX = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  cameraX.position.set(-20, 0, 0);
  cameraX.lookAt(new THREE.Vector3(0, 0, 0));

  // Create a camera aligned with the Y axis
  cameraY = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  cameraY.position.set(0, 20, 0);
  cameraY.lookAt(new THREE.Vector3(0, 0, 0));

  // Create a camera aligned with the Z axis
  cameraZ = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  cameraZ.position.set(0, 0, -30);
  cameraZ.lookAt(new THREE.Vector3(0, 0, 0));

  cameras.push(cameraZ);
  cameras.push(cameraY);
  cameras.push(cameraX);
  cameras.push(orthographicCamera);
  cameras.push(perspectiveCamera);

  scene.add(perspectiveCamera);
  scene.add(orthographicCamera);
  scene.add(cameraX);
  scene.add(cameraY);
  scene.add(cameraZ);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function addBox(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(5, 5, 13);
  mesh = new THREE.Mesh(geometry, materialgreen);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addWheel(obj, x, y, z) {
  geometry = new THREE.CylinderGeometry(1, 1, 1.5, 32);
  mesh = new THREE.Mesh(geometry, materialred);
  mesh.rotation.z += Math.PI / 2;
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addConnector(obj, x, y, z) {
  geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
  mesh = new THREE.Mesh(geometry, materialred);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function CreateTrailer(x, y, z) {
  "use strict";

  trailer = new THREE.Object3D();
  addBox(trailer, 0, 4.5, 6.5);
  addWheel(trailer, 2, 1, 11);
  addWheel(trailer, 2, 1, 8.75);
  addWheel(trailer, -2, 1, 8.75);
  addWheel(trailer, -2, 1, 11);
  addConnector(trailer, 0, 1.75, 3);

  scene.add(trailer);

  trailer.position.x = x;
  trailer.position.y = y;
  trailer.position.z = z;
}

function addTronco(obj, x, y, z) {
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

function addCintura(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(4.5, 1, 6);
  mesh = new THREE.Mesh(geometry, materialred);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addTorco(obj, x, y, z) {
  torco = new THREE.Group();

  addTronco(torco, 0, 5.5, 0);
  addAbdomen(torco, 0, 3, 0);
  addCintura(torco, 0, 1.5, 0);
  addWheel(torco, 3, 1, 0);
  addWheel(torco, -3, 1, 0);
  torco.position.set(x, y, z);

  obj.add(torco);
}

function addcranio(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(2, 2, 2);
  mesh = new THREE.Mesh(geometry, materialgreen);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addCabeca(obj, x, y, z) {
  cabeca = new THREE.Group();

  addcranio(cabeca, 0, 1, 1);
  /*olhos e cornos */
  cabeca.position.set(x, y, z);
  obj.add(cabeca);
}

function addBraco(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(2, 3, 2);
  mesh = new THREE.Mesh(geometry, materialblue);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addAntebraco(obj, x, y, z) {
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

function addBracoDir(obj, x, y, z) {
  bracoDir = new THREE.Group();

  addBraco(bracoDir, 0, 0.5, 3);
  addAntebraco(bracoDir, 0, -2, 1);
  addEscape(bracoDir, -1.25, 1, 3);
  bracoDir.position.set(x, y, z);
  obj.add(bracoDir);
}

function addBracoESq(obj, x, y, z) {
  bracoEsq = new THREE.Group();

  addBraco(bracoEsq, 0, 0.5, 3);
  addAntebraco(bracoEsq, 0, -2, 1);
  addEscape(bracoEsq, 1.25, 1, 3);
  bracoEsq.position.set(x, y, z);
  obj.add(bracoEsq);
}

function CreateRobo(x, y, z) {
  "use strict";

  robot = new THREE.Object3D();

  addTorco(robot, 0, 0, 0);
  addCabeca(robot, 0, 7, -1);
  addBracoDir(robot, -5, 5, -1);
  addBracoESq(robot, 5, 5, -1);
  /*
  addPernas
  addBracoDir
  addBracoEsq
  */
  scene.add(robot);
  robot.position.x = x;
  robot.position.y = y;
  robot.position.z = z;
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions() {
  "use strict";
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
  if (direita == true || esquerda == true || frente == true || tras == true) {
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
    if (rotcabfrente == true && cabeca.rotation.x > minRotationX) {
      cabeca.rotation.x -= angcab;
      rotcabfrente = false;
    } else if (rotcabtras == true && cabeca.rotation.x < maxRotationX) {
      cabeca.rotation.x += angcab;
      rotcabtras = false;
    }
  } else if (latBraco == true || medBraco == true) {
    if (latBraco == true && bracoEsq.position.x < maxCoord) {
      bracoDir.position.x -= 0.1;
      bracoEsq.position.x += 0.1;
      latBraco = false;
    } else if (medBraco == true && bracoEsq.position.x > minCoord) {
      bracoDir.position.x += 0.1;
      bracoEsq.position.x -= 0.1;
      medBraco = false;
    }
  } else if (wirestate == true) {
    materialred.wireframe = !materialred.wireframe;
    materialblue.wireframe = !materialblue.wireframe;
    materialgreen.wireframe = !materialgreen.wireframe;
    wirestate = false;
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

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  "use strict";
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
    case keys[82]:
    case keys[104]: //R(r)
      rotcabfrente = true;
      break;

    case keys[70]:
    case keys[92]: //F(f)
      rotcabtras = true;
      break;

    case keys[68]:
    case keys[90]: //D(d)
      latBraco = true;
      break;

    case keys[69]:
    case keys[91]: //E(e)
      medBraco = true;
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
