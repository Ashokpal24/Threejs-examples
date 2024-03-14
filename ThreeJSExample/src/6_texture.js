import * as THREE from "three";
import GUI from "lil-gui";

class DegRadHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return THREE.MathUtils.radToDeg(this.obj[this.prop]);
  }
  set value(v) {
    this.obj[this.prop] = THREE.MathUtils.degToRad(v);
  }
}

class StringToNumberHelper {
  constructor(obj, prop) {
    this.obj = obj;
    this.prop = prop;
  }
  get value() {
    return this.obj[this.prop];
  }
  set value(v) {
    this.obj[this.prop] = parseFloat(v);
  }
}

function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const scene = new THREE.Scene();
  const gui = new GUI();
  const loadingManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadingManager);

  const wrapModes = {
    ClampToEdgeWrapping: THREE.ClampToEdgeWrapping,
    RepeatWrapping: THREE.RepeatWrapping,
    MirroredRepeatWrapping: THREE.MirroredRepeatWrapping,
  };

  const loadingElem = document.querySelector("#loading");
  const progressBarElem = loadingElem.querySelector(".progressbar");
  let objectList = [];

  function updateTexture() {
    texture.needsUpdate = true;
  }
  const textureLoader = (url) => {
    const tempTexture = loader.load(url);
    tempTexture.colorSpace = THREE.SRGBColorSpace;
    return tempTexture;
  };

  const texture = textureLoader("./texture/gigachad.webp");

  const material = new THREE.MeshBasicMaterial({
    map: texture,
  });

  loadingManager.onLoad = () => {
    loadingElem.style.display = "none";
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    objectList.push(cube);
  };

  loadingManager.onProgress = (
    urlOfLastItemLoaded,
    itemsLoaded,
    itemsTotal,
  ) => {
    const progress = itemsLoaded / itemsTotal;
    progressBarElem.style.transform = `scaleX(${progress})`;
  };

  gui
    .add(new StringToNumberHelper(texture, "wrapS"), "value", wrapModes)
    .name("texture.wraps")
    .onChange(updateTexture);
  gui
    .add(new StringToNumberHelper(texture, "wrapT"), "value", wrapModes)
    .name("texture.wrapT")
    .onChange(updateTexture);
  gui.add(texture.repeat, "x", 0, 5, 0.01).name("texture.repeat.x");
  gui.add(texture.repeat, "y", 0, 5, 0.01).name("texture.repeat.y");
  gui.add(texture.offset, "x", -2, 2, 0.01).name("texture.offset.x");
  gui.add(texture.offset, "y", -2, 2, 0.01).name("texture.offset.y");
  gui.add(texture.center, "x", -0.5, 1.5, 0.01).name("texture.center.x");
  gui.add(texture.center, "y", -0.5, 1.5, 0.01).name("texture.center.y");
  gui
    .add(new DegRadHelper(texture, "rotation"), "value", -360, 360)
    .name("texture.rotation");

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
