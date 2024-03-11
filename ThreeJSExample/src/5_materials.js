import * as THREE from "three";
import GUI from "lil-gui";

function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  const scene = new THREE.Scene();
  const gui = new GUI();
  const textureLoader = new THREE.TextureLoader();

  const loadTexture = (url) =>
    new Promise((resolve, reject) => {
      textureLoader.load(url, resolve, undefined, reject);
    });

  const addRoughnessTexture = async (obj, key) => {
    const loadRoughnessTexture = await loadTexture(
      "./texture/brick_roughness.jpg",
    );
    loadRoughnessTexture.wrapT = THREE.RepeatWrapping;
    loadRoughnessTexture.wrapS = THREE.RepeatWrapping;
    loadRoughnessTexture.repeat.set(9, 1);
    obj[key] = loadRoughnessTexture;
    // material.needsUpdate = true;
    // material.roughnessMap = loadRoughnessTexture;
  };
  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 75);
  camera.position.set(0, 0, 35);
  scene.add(camera);

  const torusMaterial = new THREE.MeshStandardMaterial({
    color: 0xff0000,
    roughness: 0.3,
    metalness: 1,
    roughnessMap: null,
  });
  addRoughnessTexture(torusMaterial);
  const torusGeometry = new THREE.TorusKnotGeometry(10, 3, 200, 32);
  const torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
  scene.add(torusMesh);

  const changeColor = (color) =>
    function (value) {
      if (typeof value == String) {
        value = value.replace("#", "0x");
      }
      color.setHex(value);
    };

  const changeTexture = (material, attrKey, textures) =>
    function (key) {
      console.log(key);
      material[attrKey] = textures[key];
      material.needsUpdate = true;
    };

  const folder = gui.addFolder("Material");
  folder.add(torusMaterial, "roughness", 0, 1);
  folder.add(torusMaterial, "metalness", 0, 1);

  const torusData = {
    color: torusMaterial.color.getHex(),
    emission: torusMaterial.emissive.getHex(),
    roughnessMap: "None",
  };

  folder
    .addColor(torusData, "color")
    .onChange(changeColor(torusMaterial.color));
  folder
    .addColor(torusData, "emission")
    .onChange(changeColor(torusMaterial.emissive));

  const torusRoughnessTextures = {
    None: null,
    roughnessMap: torusMaterial.roughnessMap,
  };
  addRoughnessTexture(torusRoughnessTexture, "roughnessMap");

  folder
    .add(torusData, "roughnessMap", Object.keys(torusRoughnessTextures))
    .onChange(
      changeTexture(torusMaterial, "roughnessMap", torusRoughnessTextures),
    );
  const ambientLight = new THREE.AmbientLight(0x000000);
  scene.add(ambientLight);

  const light1 = new THREE.DirectionalLight(0xffffff, 3);
  light1.position.set(0, 200, 0);
  scene.add(light1);

  const light2 = new THREE.DirectionalLight(0xffffff, 3);
  light2.position.set(100, 200, 100);
  scene.add(light2);

  const light3 = new THREE.DirectionalLight(0xffffff, 3);
  light3.position.set(-100, -200, -100);
  scene.add(light3);

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
    torusMesh.rotation.x += 0.005;
    torusMesh.rotation.y += 0.005;

    if (resizeRenderToDisplaySize(renderer)) {
      const tempCanvas = renderer.domElement;
      camera.aspect = tempCanvas.clientWidth / tempCanvas.clientHeight;
      camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  };
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

main();
