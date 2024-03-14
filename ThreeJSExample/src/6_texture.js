import * as THREE from "three";
import GUI from "lil-gui";

function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const scene = new THREE.Scene();
  const gui = new GUI();
  const textureLoader = new THREE.TextureLoader();

  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 75);
  camera.position.set(0, 0, 3);
  scene.add(camera);

  const loadTexture = (url) =>
    new Promise((resolve, reject) => {
      textureLoader.load(url, resolve, undefined, reject);
    });

  const createTextureMat = async (url, material) => {
    const textureMap = await loadTexture(url);
    material.map = textureMap;
    material.needsUpdate = true;
  };
  let objectList = [];
  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const boxMaterial = new THREE.MeshBasicMaterial();
  createTextureMat("./texture/gigachad.webp", boxMaterial);
  const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  objectList.push(boxMesh);
  scene.add(boxMesh);

  const ambientLight = new THREE.AmbientLight(0x000000);
  scene.add(ambientLight);

  const resizeRenderToDisplaySize = (renderer) => {
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
  };

  const render = (time) => {
    if (resizeRenderToDisplaySize(renderer)) {
      const tempCanvas = renderer.domElement;
      camera.aspect = tempCanvas.clientWidth / tempCanvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    objectList.forEach((obj, idx) => {
      obj.rotation.x += 0.005;
      obj.rotation.y += 0.005;
    });
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

main();
