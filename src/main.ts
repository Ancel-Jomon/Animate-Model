import * as THREE from "three";

import { GLTFLoader, OrbitControls } from "three/examples/jsm/Addons.js";
import { initialize } from "./poseEstimation";
import { poseBones } from "./bones";

var scene: THREE.Scene,
  camera: THREE.Camera,
  renderer: THREE.WebGLRenderer,
  controls: OrbitControls;
var skeltonhelper: THREE.SkeletonHelper, clock: THREE.Clock;

export var model: THREE.Object3D<THREE.Object3DEventMap>;

const h = window.innerHeight;
const w = window.innerWidth;

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);

  document.body.appendChild(renderer.domElement);

  clock = new THREE.Clock();

  const fov = 75;
  const asratio = w / h;
  const near = 0.1;
  const far = 1000;
  camera = new THREE.PerspectiveCamera(fov, asratio, near, far);
  camera.position.z = 3;
  camera.position.y = 2;

  scene = new THREE.Scene();
  controls = new OrbitControls(camera, renderer.domElement);

  scene.background = new THREE.Color("rgb(255, 255, 255)");

  // const light = new THREE.PointLight(0xffffff, 50);
  // light.position.set(0.8, 1.4, 1.0);
  // scene.add(light);

  const ambientLight = new THREE.AmbientLight();
  scene.add(ambientLight);

  const dirlight = new THREE.DirectionalLight("rgb(255, 255, 255)", 1);
  scene.add(dirlight);
}

function loadmodel() {
  const gltfloader = new GLTFLoader();

  gltfloader.load("assets/bian.glb", (gltf) => {
    model = gltf.scene;
    scene.add(model);

    skeltonhelper = new THREE.SkeletonHelper(gltf.scene);
    scene.add(skeltonhelper);
    
  });
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  controls.update();
}
init();
loadmodel();
initialize();
animate();
