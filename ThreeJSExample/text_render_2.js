import * as THREE from "three";
import {
  FontLoader,
  TextGeometry,
} from "./node_modules/three/examples/jsm/Addons.js";

function main() {
  let meshInstances = [];
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
  });

  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 75;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.positionz = 80;

  const scene = new THREE.Scene();

  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  const createMesh = (geometry, color, x, y, z) => {
    const material = new THREE.MeshPhongMaterial({
      color,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = x;
    mesh.position.y = y;
    mesh.position.z = z;
    scene.add(mesh);
    return mesh;
  };
  //   create mesh
  const loader = new FontLoader();

  function loadFont(url) {
    return new Promise((resolve, reject) => {
      loader.load(url, resolve, undefined, reject);
    });
  }
  async function createText() {
    const font = await loadFont("./public/fonts/Poppins_Bold.json");
    const textGeometry = new TextGeometry("Ashok", {
      font,
      size: 3.0,
      height: 1,
      curveSegments: 12,
      bevelEnabled: true,
      bevelThickness: 0.15,
      bevelSize: 0.3,
      bevelSegments: 5,
    });
    meshInstances.push(createMesh(textGeometry, 0x66dec0, 0, 0, -20));
  }
  createText();

  function resizeRenderToDisplaySize(renderer) {
    const tempCanvas = renderer.domElement;
    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor(tempCanvas.clientWidth * pixelRatio);
    const height = Math.floor(tempCanvas.clientHeight * pixelRatio);
    const needResize =
      tempCanvas.width != width || tempCanvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function render(time) {
    time *= 0.001;
    meshInstances.forEach((meshI, index) => {
      const speed = 1 + index * 0.1;
      const rotationSpeed = time * speed;
      meshI.rotation.x = rotationSpeed;
      meshI.rotation.y = rotationSpeed;
    });
    if (resizeRenderToDisplaySize(renderer)) {
      const tempCanvas = renderer.domElement;
      camera.aspect = tempCanvas.clientWidth / tempCanvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
main();
