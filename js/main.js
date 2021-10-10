import * as THREE from "three";

// create a new scene
var scene = new THREE.Scene();

// field of view
var fov = 20;
// aspect ratio - use full width of container / height
var aspect = window.innerWidth / window.innerHeight;
// setup the clipping plane
var near = 1; // front clipping plane
var far = 2000; // back clipping plane
// create new camera with defined vars from above
var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 500);

// create a new WebGLRenderer object
const renderer = new THREE.WebGLRenderer();
const container = document.getElementById("globe_scene");
// set the size of the rending window -- smaller than full
// size will result in lower resolution (ie window.innerWidth / 2
// and window.innerHeight / 2 would result in HALF the resolution)
renderer.setSize(window.innerWidth, window.innerHeight);
// add the renderer to our page. This is the canvas element that the renderer uses
// to display our scene
container.appendChild(renderer.domElement);
// resize three js container on window resize
window.addEventListener("resize", onWindowResize, false);

// setup dimensions of the sphere
var radius = 300;
// moar segments == moar roundedness!
var widthSegments = 60;
var heightSegments = 30;

var geometry = new THREE.SphereBufferGeometry(
  radius,
  widthSegments,
  heightSegments
);
var material = new THREE.MeshNormalMaterial();
var mesh = new THREE.Mesh(geometry, material);

scene.add(mesh);

const wireframeGeometry = new THREE.WireframeGeometry(geometry);
const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x42b883 });
const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

mesh.add(wireframe);

mesh.position.set(0, -320, 0);

createjs.Ticker.timingMode = createjs.Ticker.RAF;
createjs.Ticker.addEventListener("tick", animate);

let rotate = {
  x: 0,
  y: 0,
};

let rotateAmount = 0.5;
let rotateAvailable = true;

function transformX(scroll) {
  if (scroll.wheelDeltaY > 0 && rotateAvailable) {
    rotate.x += rotateAmount;
    transformGlobe(rotate.x);
    rotateAvailable = false;
    setTimeout(() => {
      rotateAvailable = true;
    }, 1000);
  } else if (scroll.wheelDeltaY < 0 && rotateAvailable) {
    rotate.x -= rotateAmount;
    transformGlobe(rotate.x);
    rotateAvailable = false;
    setTimeout(() => {
      rotateAvailable = true;
    }, 1000);
  }
}

function transformGlobe(x) {
  createjs.Tween.get(mesh.rotation, { loop: false }).to(
    { x: x },
    600,
    createjs.Ease.getPowInOut(3)
  );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

document
  .getElementById("globe_scene")
  .addEventListener("wheel", (event) => transformX(event));

function animate() {
  renderer.render(scene, camera);
}
