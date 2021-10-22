import * as THREE from "three";
import {
  BoxBufferGeometry,
  InstancedMesh,
  Mesh,
  MeshBasicMaterial,
  SphereBufferGeometry,
  Spherical,
} from "three";

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// scene parameters
var scene = new THREE.Scene();
var fov = 20;
var aspect = window.innerWidth / window.innerHeight;
var near = 1; 
var far = 2000; 

// camera parameters
var camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 300, 500);

// renderer parameters
const renderer = new THREE.WebGLRenderer();
const container = document.getElementById("globe_scene");
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

//autoresize
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);
window.addEventListener("resize", onWindowResize, false);

// controls
const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

// sphere
var radius = 300;
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
mesh.rotation.set(0, 0, Math.PI / 2);
const wireframeGeometry = new THREE.WireframeGeometry(globe);
const wireframeMaterial = new THREE.LineBasicMaterial({ color: 0x42b883 });
const wireframe = new THREE.LineSegments(wireframeGeometry, wireframeMaterial);
mesh.add(wireframe);
let lantaarnpaal;

//load model
const loader = new GLTFLoader();
loader.load( 'models/untitled5.glb', function ( gltf ) {
  lantaarnpaal = new THREE.Object3D()
  lantaarnpaal.add(gltf.scene.children[0]);
  console.log(lantaarnpaal)
  lantaarnpaal.scale.set(4,4,4)
  test();
  // lantaarnpaal.position.set(0,300,0)
  // lantaarnpaal.scale.set(5,5,5)
  // const axesHelper = new THREE.AxesHelper( 400 );
  // lantaarnpaal.add( axesHelper )
  // lantaarnpaal.lookAt(0,0,0)
  // console.log(lantaarnpaal.rotation)
  // lantaarnpaal.rotateX(-Math.PI/2)
  // console.log(lantaarnpaal.rotation)

}, undefined, function ( error ) {

	console.error( error );

} );

function randomSpherePoint(radius) {
  //pick numbers between 0 and 1
  var u = Math.random();
  var v = 0.5;
  // create random spherical coordinate
  var theta = 2 * Math.PI * u;
  var phi = Math.acos(2 * v - 1);
  return new Spherical(radius, phi, theta);
}
function test() {
  for (let i = 0; i < 30; i++) {
    const building = lantaarnpaal.clone();
    const pt = randomSpherePoint(300);
    building.position.setFromSpherical(pt);
    building.lookAt(0, 0, 0);
    building.rotateX(-Math.PI/2)
    building.castShadow = true;
    building.receiveShadow = false;
    mesh.add(building);
  }
}
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



function animate() {
  controls.update();
  renderer.render(scene, camera);
  renderer.shadowMap.enabled = true;
}
