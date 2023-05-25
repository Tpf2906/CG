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

var trailer, robot, pernas, bracoDir, bracoEsq, cabeca, torco, perna,pesesq,pesdir;

var angcab = Math.PI / 16,
  maxRotationCabX = Math.PI / 2,
  minRotationCabX = 0,
  maxRotationPernaX = Math.PI / 4,
  minRotationPernaX = -Math.PI / 2,
  minRotationPesX = -Math.PI / 2,
  maxRotationPesX = 0
  maxCoord = 4.9,
  minCoord = 3.1;

var robotBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());
var trailerBox = new THREE.Box3(new THREE.Vector3(), new THREE.Vector3());

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

var camera_index;

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
  "use strict";

  scene = new THREE.Scene();
  
  const robothelper = new THREE.Box3Helper( robotBox, 0xffff00 );
  scene.add( robothelper );
  const trailerhelper = new THREE.Box3Helper( trailerBox, 0xff00ff );
  scene.add( trailerhelper );

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
  
  // Create a perspective camera
  const perspectiveCamera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  perspectiveCamera.position.set(20, 20, 20);
  perspectiveCamera.lookAt(scene.position);

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
  mesh = new THREE.Mesh(geometry, materialblack);
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


  trailer.position.set(x, y, z);
  trailerBox.setFromObject(trailer);
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

function addOlho(obj, x, y, z) {
  geometry = new THREE.CylinderGeometry(0.5, 0.5, 0.5, 32);
  material = new THREE.MeshBasicMaterial(materialblue);
  mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.x += Math.PI / 2;
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addAntena(obj, x, y, z) {
  geometry = new THREE.BoxGeometry(0.1, 1, 0.5);
  material = new THREE.MeshBasicMaterial(materialred);
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  obj.add(mesh)
}

function addCabeca(obj, x, y, z) {
  cabeca = new THREE.Group();

  addcranio(cabeca, 0, 1, 1);
  addOlho(cabeca, 0.5, 1.5, 0);
  addOlho(cabeca, -0.5, 1.5, 0);
  addAntena(cabeca, 1, 2, 1);
  addAntena(cabeca, -1, 2, 1);
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

function addCoxas(obj, x, y, z) {
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

function addPernaDir(obj, x, y, z) {
  perna = new THREE.Group();

  addCoxas(perna, 0, -1, 0);
  addCanela(perna, 0, -4.5, 0);
  addPesDir(perna, x-1.5, -7.5, 0);
  addWheel(perna, x + 0.25, -3.75, 0);
  addWheel(perna, x + 0.25, -6, 0);
  /*
  addCoxas
  addcanela
  addwhell
  */
  perna.position.set(x, y, z);
  obj.add(perna);
}

function addPernaEsq(obj, x, y, z) {
  perna = new THREE.Group();

  addCoxas(perna, 0, -1, 0);
  addCanela(perna, 0, -4.5, 0);
  addPesEsq(perna, x+1.5, -7.5, 0);
  addWheel(perna, x - 0.25, -3.75, 0);
  addWheel(perna, x - 0.25, -6, 0);
  
  /*
  addCoxas
  addcanela
  addwhell
  */
  perna.position.set(x, y, z);
  obj.add(perna);
}

function addPernas(obj, x, y, z) {
  pernas = new THREE.Group();

  addPernaDir(pernas, 1.5, 0, 0);
  addPernaEsq(pernas, -1.5, 0, 0);

  pernas.position.set(x, y, z);
  obj.add(pernas);
}

function addPesEsq(obj,x,y,z){
  geometry = new THREE.BoxGeometry(2, 1, 2);
  pesesq = new THREE.Mesh(geometry,materialgreen);
  pesesq.position.set(x,y,z);
  obj.add(pesesq);
}

function addPesDir(obj,x,y,z){
  geometry = new THREE.BoxGeometry(2, 1, 2);
  pesdir = new THREE.Mesh(geometry,materialgreen);
  pesdir.position.set(x,y,z);
  obj.add(pesdir);
}

function CreateRobo(x, y, z) {
  "use strict";

  robot = new THREE.Object3D();

  addTorco(robot, 0, 0, 0);
  addCabeca(robot, 0, 7, -1);
  addBracoDir(robot, -5, 5, -1);
  addBracoESq(robot, 5, 5, -1);
  addPernas(robot, 0, 1, 0);

  scene.add(robot);
  robot.position.set(x, y, z);
  robotBox.setFromObject(robot)
}

//////////////////////
/* CHECK COLLISIONS */
//////////////////////
function checkCollisions(box, otherBox) {
  "use strict";

  // Doesn't check the y because objects don't move in the y direction.
  return (
    box.min.x <= otherBox.max.x && box.max.x >= otherBox.min.x &&
    box.min.z <= otherBox.max.z && box.max.z >= otherBox.min.z
    );
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
  
  // questao -> podemos usar Box3 ou temos que implementar as nossas AABB boxes?
  // "Custom" funcao para verificar colisoes
  // console.log(checkCollisions(trailerBox, robotBox));
  // Verifica se há colisão mas só o deve fazer quando o Robot está em modo Camião
  // Boolean que verica se as pecas todas do robot estao para dentro?
  // Quando detetamos a colisao calculamos a diferenca entre a posicao do centro do trailer e a posicao onde tem que ficar no fim da
  // animacao e depois em cada ciclo do update mudamos a posicao do trailer e retornamos logo para nao podermos mexer em nada
  // isto acontece ate chegarmos a posicao que queremos
  
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
    if (rotcabfrente == true && cabeca.rotation.x > minRotationCabX) {
      cabeca.rotation.x -= angcab;
    } else if (rotcabtras == true && cabeca.rotation.x < maxRotationCabX) {
      cabeca.rotation.x += angcab;
    }
    rotcabtras = false;
    rotcabfrente = false;
  } else if (latBraco == true || medBraco == true) {
    if (latBraco == true && bracoEsq.position.x <= maxCoord) {
      bracoDir.position.x -= 0.1;
      bracoEsq.position.x += 0.1;
    } else if (medBraco == true && bracoEsq.position.x >= minCoord) {
      bracoDir.position.x += 0.1;
      bracoEsq.position.x -= 0.1;
    }
    latBraco = false;
    medBraco = false;
  } else if (rotpesfrente == true || rotpestras == true) {
    if (rotpesfrente == true && pesesq.rotation.x > minRotationPesX) {
      pesesq.rotation.x -= angcab;
      pesdir.rotation.x -= angcab;
    } else if (rotpestras == true && pesesq.rotation.x < maxRotationPesX) {
      pesesq.rotation.x += angcab;
      pesdir.rotation.x += angcab;
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
    if (rotpernafrente == true && pernas.rotation.x > minRotationPernaX) {
      pernas.rotation.x -= angcab;
    } else if (rotpernatras == true && pernas.rotation.x < maxRotationPernaX) {
      pernas.rotation.x += angcab;
    }
    rotpernafrente = false;
    rotpernatras = false;
  } else {
    handleKeyUp;
  }
  robotBox.setFromObject(robot)
  trailerBox.setFromObject(trailer)
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
      camera_index = 2;
      break;

    case keys[51]: //Digit3
      camera_index = 1;
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
