import * as THREE from "three";
import GUI from "lil-gui";

function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const scene = new THREE.Scene();
  const gui = new GUI();
  const loadManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadManager);

  const loadingElem = document.querySelector("#loading");
  const progressBarElem = loadingElem.querySelector(".progressbar");
  const textureLoader = (url) => {
    const texture = loader.load(url);
    texture.colorSpace = new THREE.SRGBColorSpace();
    return texture;
  };
  let objectList = [];
  const materials = [
    new THREE.MeshBasicMaterial({
      map: textureLoader("./texture/flowers/flower-1.jpg"),
    }),
    new THREE.MeshBasicMaterial({
      map: textureLoader("./texture/flowers/flower-2.jpg"),
    }),
    new THREE.MeshBasicMaterial({
      map: textureLoader("./texture/flowers/flower-3.jpg"),
    }),
    new THREE.MeshBasicMaterial({
      map: textureLoader("./texture/flowers/flower-4.jpg"),
    }),
    new THREE.MeshBasicMaterial({
      map: textureLoader("./texture/flowers/flower-5.jpg"),
    }),
    new THREE.MeshBasicMaterial({
      map: textureLoader("./texture/flowers/flower-6.jpg"),
    }),
  ];

  loadManager.onLoad = () => {
    loadingElem.style.display = "none";
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(geometry, materials);
    scene.add(cube);
    objectList.push(cube);
  };

  loadManager.onProgress = (urlOfLastItemLoaded, itemsLoaded, itemsTotal) => {
    const progress = itemsLoaded / itemsTotal;
    progressBarElem.style.transform = `scaleX(${progress})`;
  };

  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 75);
  camera.position.set(0, 0, 3);
  scene.add(camera);

  // const loadTexture = (url) =>
  //   new Promise((resolve, reject) => {
  //     textureLoader.load(url, resolve, undefined, reject);
  //   });

  // const createTextureMat = async (url, material) => {
  //   const textureMap = await loadTexture(url);
  //   material.map = textureMap;
  //   material.needsUpdate = true;
  // };
  // let objectList = [];
  // const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  // const boxMaterial = new THREE.MeshBasicMaterial();
  // createTextureMat("./texture/gigachad.webp", boxMaterial);
  // const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
  // objectList.push(boxMesh);
  // scene.add(boxMesh);

  // const ambientLight = new THREE.AmbientLight(0x000000);
  // scene.add(ambientLight);

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
