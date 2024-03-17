import * as THREE from "three";
import { LightProbeHelper, OrbitControls } from "three/examples/jsm/Addons";
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
class MinMaxGUIHelper {
  constructor(obj, minProp, maxProp, minDif) {
    this.obj = obj;
    this.minProp = minProp;
    this.maxProp = maxProp;
    this.minDif = minDif;
  }
  get min() {
    return this.obj[this.minProp];
  }
  set min(v) {
    this.obj[this.minProp] = v;
    this.obj[this.maxProp] = Math.max(this.obj[this.maxProp], v + this.minDif);
  }
  get max() {
    return this.obj[this.maxProp];
  }
  set max(v) {
    this.obj[this.maxProp] = v;
    this.min = this.min; // this will call the min setter
  }
}
function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.shadowMap.enabled = true;
  renderer.setScissorTest(true);

  const scene = new THREE.Scene();
  const gui = new GUI();

  const loadingManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadingManager);

  const loadingElem = document.querySelector("#loading");
  const progressBarElem = loadingElem.querySelector(".progressbar");
  const view1Elem = document.querySelector("#view1");
  const view2Elem = document.querySelector("#view2");

  const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
  camera.position.set(0, 10, 20);
  scene.add(camera);
  const cameraHelper = new THREE.CameraHelper(camera);
  scene.add(cameraHelper);
  const controls = new OrbitControls(camera, view1Elem);
  controls.target.set(0, 5, 0);
  controls.update();

  const camera2 = new THREE.PerspectiveCamera(60, 2, 0.1, 500);
  camera2.position.set(40, 10, 30);
  camera2.lookAt(0, 5, 0);

  const controls2 = new OrbitControls(camera2, view2Elem);
  controls2.target.set(0, 5, 0);
  controls2.update();

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
  function updateCamera() {
    camera.updateProjectionMatrix();
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

  gui.add(camera, "fov", 1, 180);
  const minMaxGUIHelper = new MinMaxGUIHelper(camera, "near", "far", 0.1);
  gui.add(minMaxGUIHelper, "min", 0.1, 50, 0.1).name("near");
  gui.add(minMaxGUIHelper, "max", 0.1, 50, 0.1).name("far");

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
  function setScissorForElement(elem) {
    const canvasRect = canvas.getBoundingClientRect();
    const elemRect = elem.getBoundingClientRect();

    // compute a canvas relative rectangle
    const right = Math.min(elemRect.right, canvasRect.right);
    const left = Math.max(0, elemRect.left - canvasRect.left);
    const bottom = Math.min(elemRect.bottom, canvasRect.bottom);
    const top = Math.max(0, elemRect.top - canvasRect.top);

    const width = Math.min(canvasRect.width, right - left);
    const height = Math.min(canvasRect.height, bottom - top);
    // console.log(
    //   "canvas: ",
    //   canvasRect,
    //   "element: ",
    //   elemRect,
    //   "width: ",
    //   width,
    //   "height: ",
    //   height,
    //   "left",
    //   left,
    //   "right",
    //   right,
    //   "classname",
    //   elem.id,
    // );

    // setup the scissor to only render to that part of the canvas
    const positiveYUpBottom = canvasRect.height - bottom;
    renderer.setScissor(left, positiveYUpBottom, width, height);
    renderer.setViewport(left, positiveYUpBottom, width, height);

    // return the aspect
    return width / height;
  }

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
    resizeRendererToDisplaySize(renderer);

    // turn on the scissor

    // render the original view
    {
      // adjust the camera for this aspect
      let aspect1 = setScissorForElement(view1Elem);

      camera.aspect = aspect1;
      camera.updateProjectionMatrix();
      cameraHelper.update();

      // don't draw the camera helper in the original view
      cameraHelper.visible = false;
      helper.visible = true;

      scene.background = new THREE.Color(0x000000);

      // render
      renderer.render(scene, camera);
    }

    // render from the 2nd camera
    {
      let aspect2 = setScissorForElement(view2Elem);

      // adjust the camera for this aspect
      camera2.aspect = aspect2;
      camera2.updateProjectionMatrix();

      // draw the camera helper in the 2nd view
      cameraHelper.visible = true;
      helper.visible = false;

      scene.background = new THREE.Color(0x000040);

      renderer.render(scene, camera2);
    }

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
main();
