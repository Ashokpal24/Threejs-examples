import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons";
import GUI from "lil-gui";

class ColorGUIHelper {
  constructor(object, prop) {
    this.object = object;
    this.prop = prop;
  }
  get value() {
    return `#${this.object[this.prop].getHexString()}`;
  }
  set value(hexString) {
    this.object[this.prop].set(hexString);
  }
}
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

function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.shadowMap.enabled = true;
  const scene = new THREE.Scene();
  const gui = new GUI();

  const loadingManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadingManager);

  const loadingElem = document.querySelector("#loading");
  const progressBarElem = loadingElem.querySelector(".progressbar");

  const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
  camera.position.set(0, 10, 20);
  scene.add(camera);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const checkerTexture = loader.load("./texture/checker.png");
  const chadTexture = loader.load("./texture/gigachad.webp");

  const color = 0xffffff;
  const intensity = 150;
  const light = new THREE.SpotLight(color, intensity);
  light.position.set(0, 10, 0);
  light.target.position.set(-5, 0, 0);
  scene.add(light);
  scene.add(light.target);
  light.castShadow = true;
  light.shadow.mapSize.width = 2048;
  light.shadow.mapSize.height = 2048;

  const distance = 50;
  light.shadow.camera.left = -distance;
  light.shadow.camera.right = distance;
  light.shadow.camera.top = distance;
  light.shadow.camera.bottom = -distance;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 50;
  light.shadow.bias = 0.001;

  const helper = new THREE.SpotLightHelper(light);
  scene.add(helper);
  function makeXYZGUI(gui, vector3, name, onChangeFn) {
    const folder = gui.addFolder(name);
    folder.add(vector3, "x", -10, 10).onChange(onChangeFn);
    folder.add(vector3, "y", 0, 10).onChange(onChangeFn);
    folder.add(vector3, "z", -10, 10).onChange(onChangeFn);
    folder.open();
  }
  function updateLight() {
    light.target.updateMatrixWorld();
    helper.update();
  }
  updateLight();
  gui.addColor(new ColorGUIHelper(light, "color"), "value").name("color");
  gui.add(light, "intensity", 0, 2, 0.01);
  gui.add(light, "penumbra", 0, 1, 0.01);
  gui
    .add(new DegRadHelper(light, "angle"), "value", 0, 90)
    .name("angle")
    .onChange(updateLight);
  makeXYZGUI(gui, light.position, "position", updateLight);
  makeXYZGUI(gui, light.target.position, "target", updateLight);

  loadingManager.onLoad = () => {
    loadingElem.style.display = "none";
    const planeSize = 40;

    checkerTexture.wrapS = THREE.RepeatWrapping;
    checkerTexture.wrapT = THREE.RepeatWrapping;
    checkerTexture.magFilter = THREE.NearestFilter;
    checkerTexture.colorSpace = THREE.SRGBColorSpace;
    const repeats = planeSize / 2;
    checkerTexture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: checkerTexture,
      side: THREE.DoubleSide,
    });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);
    planeMesh.receiveShadow = true;
    planeMesh.rotation.x = Math.PI * -0.5;
    scene.add(planeMesh);

    const cubeSize = 4;
    const cubeGeo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const cubeMat = new THREE.MeshPhongMaterial({ map: chadTexture });
    const cubeMesh = new THREE.Mesh(cubeGeo, cubeMat);
    cubeMesh.castShadow = true;
    cubeMesh.position.set(cubeSize + 1, cubeSize / 2, 0);
    scene.add(cubeMesh);
  };

  loadingManager.onProgress = (
    urlOfLastItemLoaded,
    itemsLoaded,
    itemsTotal,
  ) => {
    console.log(urlOfLastItemLoaded);
    const progress = itemsLoaded / itemsTotal;
    progressBarElem.style.transform = `scaleX(${progress})`;
  };
  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }

    return needResize;
  }

  function render() {
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
main();
