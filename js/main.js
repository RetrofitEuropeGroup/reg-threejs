import * as THREE from "three";
import {
  BoxBufferGeometry,
  Mesh,
  MeshBasicMaterial,
  SphereBufferGeometry,
  Spherical,
} from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

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

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

const light = new THREE.PointLight(0xffffff, 0.8, 18);
light.position.set(-3, 6, -3);
light.castShadow = true;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 25;
scene.add(light);

// setup dimensions of the sphere
var radius = 300;
// moar segments == moar roundedness!
var widthSegments = 120;
var heightSegments = 120;

var globe = new THREE.SphereBufferGeometry(
  radius,
  widthSegments,
  heightSegments
);
var material = new THREE.MeshNormalMaterial();
var mesh = new THREE.Mesh(globe, material);
mesh.receiveShadow = true;
mesh.castShadow = true;
scene.add(mesh);

function randomSpherePoint(radius) {
  //pick numbers between 0 and 1
  var u = Math.random();
  var v = 0.4;
  // create random spherical coordinate
  var theta = 2 * Math.PI * u;
  var phi = Math.acos(2 * v - 1);
  return new Spherical(radius, phi, theta);
}
for (let i = 0; i < 30; i++) {
  const building = new Mesh(
    new BoxBufferGeometry(15, 15, 15),
    new MeshBasicMaterial({ color: "white" })
  );
  const pt = randomSpherePoint(300);
  building.position.setFromSpherical(pt);
  building.lookAt(0, 0, 0);
  building.castShadow = true;
  building.receiveShadow = false;
  mesh.add(building);
}

const wireframeGeometry = new THREE.WireframeGeometry(globe);
const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x42b883 });
const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);

mesh.add(wireframe);

mesh.position.set(0, -300, 0);
mesh.rotation.set(0, 0, Math.PI / 2);

createjs.Ticker.timingMode = createjs.Ticker.RAF;
createjs.Ticker.addEventListener("tick", animate);

let rotate = {
  x: 0,
  y: 0,
};

let rotateAmount = 0.2;
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

console.log(scene);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  renderer.shadowMap.enabled = true;
}
