//////////////////////
/* GLOBAL VARIABLES */
//////////////////////
var camera, scene, renderer;

var geometry, material, mesh;

var keys = {};

/////////////////////
/* CREATE SCENE(S) */
/////////////////////
function createScene() {
  "use strict";

  scene = new THREE.Scene();

  scene.add(new THREE.AxisHelper(10));

  CreateTrailer(0, 1, 0);
}

//////////////////////
/* CREATE CAMERA(S) */
//////////////////////
function createCamera() {
  "use strict";
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    1,
    1000
  );
  camera.position.x = 20;
  camera.position.y = 20;
  camera.position.z = 20;
  camera.lookAt(scene.position);
}

/////////////////////
/* CREATE LIGHT(S) */
/////////////////////

////////////////////////
/* CREATE OBJECT3D(S) */
////////////////////////
function addBox(obj, x, y, z) {
  geometry = new THREE.CubeGeometry(2, 2, 6);
  mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function addWheel(obj, x, y, z) {
  geometry = new THREE.CylinderGeometry(1, 1, 1, 32);
  material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: false });
  mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.z += Math.PI / 2;
  mesh.position.set(x, y, z);
  obj.add(mesh);
}

function CreateTrailer(x, y, z) {
  "use strict";

  var trailer = new THREE.Object3D();

  material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: false });

  addBox(trailer, 0, 2, 3);
  addWheel(trailer, 0, 0, 4);
  //addConnector(trailer);

  scene.add(trailer);

  trailer.position.x = x;
  trailer.position.y = y;
  trailer.position.z = z;
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
}

/////////////
/* DISPLAY */
/////////////
function render() {
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

  render();

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("keyup", handleKeyUp);
  window.addEventListener("resize", onResize);
}

/////////////////////
/* ANIMATION CYCLE */
/////////////////////
function animate() {
  "use strict";
  render();

  requestAnimationFrame(animate);
}

////////////////////////////
/* RESIZE WINDOW CALLBACK */
////////////////////////////
function onResize() {
  "use strict";

  renderer.setSize(window.innerWidth, window.innerHeight);

  if (window.innerHeight > 0 && window.innerWidth > 0) {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
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
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.position.z += 0.1;
          node.position.x += 0.1;
        }
      });
      break;

    case keys[38] && keys[37]: //ArrowUp and ArrowLeft
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.position.z += 0.1;
          node.position.x -= 0.1;
        }
      });
      break;

    case keys[40] && keys[39]: //ArrowDown and ArrowRight
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.position.z -= 0.1;
          node.position.x += 0.1;
        }
      });
      break;

    case keys[40] && keys[37]: //ArrowDown and ArrowLeft
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.position.z -= 0.1;
          node.position.x -= 0.1;
        }
      });
      break;

    case keys[37]: //ArrowLeft
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.position.x -= 0.1;
        }
      });
      break;

    case keys[39]: //ArrowRight
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.position.x += 0.1;
        }
      });
      break;

    case keys[40]: //ArrowDown
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.position.z -= 0.1;
        }
      });
      break;

    case keys[38]: //ArrowUp
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.position.z += 0.1;
        }
      });
      break;

    //-------camera-------
    case keys[49]: //Digit1
      camera.position.set(0, 20, 0);
      camera.rotation.set(-Math.PI / 2, 0, 0);
      break;

    case keys[50]: //Digit2
      camera.position.set(0, 3, -10);
      camera.rotation.set(0, -Math.PI, 0);
      break;

    case keys[51]: //Digit3
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.position.z += 0.1;
        }
      });
      break;

    case keys[52]: //Digit4
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.position.z += 0.1;
        }
      });
      break;

    case keys[53]: //Digit5
      scene.traverse(function (node) {
        if (node instanceof THREE.Mesh) {
          node.position.z += 0.1;
        }
      });
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
