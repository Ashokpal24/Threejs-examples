import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons";
import GUI from "lil-gui";

function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
  renderer.shadowMap.enabled = true;
  const scene = new THREE.Scene();
  //   scene.background = new THREE.Color("white");
  const gui = new GUI();

  const camera = new THREE.PerspectiveCamera(45, 2, 0.1, 100);
  camera.position.set(0, 10, 20);
  scene.add(camera);
  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const loadingManager = new THREE.LoadingManager();
  const loader = new THREE.TextureLoader(loadingManager);

  const loadingElem = document.querySelector("#loading");
  const progressBarElem = loadingElem.querySelector(".progressbar");

  loadingManager.onLoad = () => {
    loadingElem.style.display = "none";
  };

  loadingManager.onProgress = (
    urlOfLastItemLoaded,
    itemsLoaded,
    itemsTotal,
  ) => {
    const progress = itemsLoaded / itemsTotal;
    progressBarElem.style.transform = `scaleX(${progress})`;
  };
  {
    const planeSize = 40;

    const texture = loader.load("./texture/checker.png");
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    const repeats = planeSize / 2;
    texture.repeat.set(repeats, repeats);

    const planeGeo = new THREE.PlaneGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
      map: texture,
      side: THREE.DoubleSide,
    });
    planeMat.color.setRGB(1.5, 1.5, 1.5);
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.receiveShadow = true;

    mesh.rotation.x = Math.PI * -0.5;
    scene.add(mesh);
  }
  {
    const skyColor = 0xb1e1ff; // light blue
    const groundColor = 0xb97a20; // brownish orange
    const intensity = 2;
    const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
    scene.add(light);
  }
  {
    const color = 0xffffff;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.castShadow = true;
    light.position.set(0, 10, 5);
    light.target.position.set(-5, 0, 0);
    scene.add(light);
    scene.add(light.target);
  }
  const sphereShadowBases = [];
  {
    const shadowTexture = loader.load("./texture/roundshadow.png");
    const sphereRadius = 1;
    const sphereWidthDivisions = 32;
    const sphereHeightDivisions = 16;
    const sphereGeo = new THREE.SphereGeometry(
      sphereRadius,
      sphereWidthDivisions,
      sphereHeightDivisions,
    );
    const planeSize = 1;
    const shadowGeo = new THREE.PlaneGeometry(planeSize, planeSize);

    const numSpheres = 15;
    for (let i = 0; i < numSpheres; ++i) {
      const base = new THREE.Object3D();
      scene.add(base);

      //   const shadowMat = new THREE.MeshBasicMaterial({
      //     map: shadowTexture,
      //     transparent: true,
      //     depthWrite: false,
      //   });
      //   const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      //   shadowMesh.position.y = 0.001;
      //   shadowMesh.rotation.x = Math.PI * -0.5;

      //   const shadowSize = sphereRadius * 4;
      //   shadowMesh.scale.set(shadowSize, shadowSize, shadowSize);
      //   base.add(shadowMesh);

      const u = i / numSpheres;
      const sphereMat = new THREE.MeshPhongMaterial();
      sphereMat.color.setHSL(u, 1, 0.75);
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(0, sphereRadius + 2, 0);
      sphereMesh.castShadow = true;
      sphereMesh.receiveShadow = true;
      base.add(sphereMesh);

      sphereShadowBases.push({
        base,
        sphereMesh,
        // shadowMesh,
        y: sphereMesh.position.y,
      });
    }
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

  function render(time) {
    time *= 0.001;
    if (resizeRendererToDisplaySize(renderer)) {
      const canvas = renderer.domElement;
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    sphereShadowBases.forEach((sphereShadowBase, ndx) => {
      const {
        base,
        sphereMesh,
        // shadowMesh,
        y,
      } = sphereShadowBase;

      const u = ndx / sphereShadowBases.length;

      const speed = time * 0.2;
      const angle = speed + u * Math.PI * 2 * (ndx % 1 ? 1 : -1);
      const radius = Math.sin(speed - ndx) * 20;
      base.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);

      const yOff = Math.abs(Math.sin(time * 2 + ndx));
      sphereMesh.position.y = y + THREE.MathUtils.lerp(-2, 2, yOff);
      //   shadowMesh.material.opacity = THREE.MathUtils.lerp(1, 0.25, yOff);
    });
    renderer.render(scene, camera);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}
main();
