import * as THREE from "three";
import GUI from "lil-gui";

const gui = new GUI();

class AxisGridHelper {
  constructor(node, units = 10) {
    const axes = new THREE.AxesHelper();
    axes.material.depthTest = false;
    axes.renderOrder = 2;
    node.add(axes);

    const grid = new THREE.GridHelper(units, units);
    grid.material.depthTest = false;
    grid.renderOrder = 1;
    node.add(grid);

    this.grid = grid;
    this.axes = axes;
    this.visible = false;
  }
  get visible() {
    return this._visible;
  }
  set visible(v) {
    this._visible = v;
    this.axes.visible = v;
    this.grid.visible = v;
  }
}
function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
  });
  const scene = new THREE.Scene();

  // camera
  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 75;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.set(0, 50, 0);
  camera.up.set(0, 0, 1);
  camera.lookAt(0, 0, 0);
  const objects = [];

  const solarSystem = new THREE.Object3D();
  scene.add(solarSystem);
  objects.push(solarSystem);

  const radius = 1;
  const widthSegments = 6;
  const heightSegments = 6;
  const sphereGeometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments,
  );

  // add light
  const color = 0xffffff;
  const intensity = 3000;
  const light = new THREE.PointLight(color, intensity);
  scene.add(light);

  const sunMaterial = new THREE.MeshPhongMaterial({
    emissive: 0xffff00,
  });
  const sunMesh = new THREE.Mesh(sphereGeometry, sunMaterial);
  sunMesh.scale.set(5, 5, 5);
  solarSystem.add(sunMesh);
  objects.push(sunMesh);

  const earthOrbit = new THREE.Object3D();
  earthOrbit.position.x = 20;
  solarSystem.add(earthOrbit);
  objects.push(earthOrbit);

  const earthMaterial = new THREE.MeshPhongMaterial({
    color: 0x2233ff,
    emissive: 0x112244,
  });

  const earthMesh = new THREE.Mesh(sphereGeometry, earthMaterial);
  earthMesh.scale.set(2, 2, 2);
  earthOrbit.add(earthMesh);
  objects.push(earthMesh);

  const moonOrbit = new THREE.Object3D();
  moonOrbit.position.x = 5;
  earthOrbit.add(moonOrbit);
  objects.push(moonOrbit);

  const moonMaterial = new THREE.MeshPhongMaterial({
    color: 0x888888,
    emissive: 0x222222,
  });
  const moonMesh = new THREE.Mesh(sphereGeometry, moonMaterial);
  moonOrbit.add(moonMesh);
  objects.push(moonOrbit);

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

  function makeAxisGrid(node, label, units) {
    const helper = new AxisGridHelper(node, units);
    gui.add(helper, "visible").name(label);
  }

  makeAxisGrid(solarSystem, "solarSystem", 25);
  makeAxisGrid(sunMesh, "sunMesh");
  makeAxisGrid(earthOrbit, "earthOrbit");
  makeAxisGrid(earthMesh, "earthMesh");
  makeAxisGrid(moonOrbit, "moonOrbit");
  makeAxisGrid(moonMesh, "moonMesh");

  function render(time) {
    time *= 0.001;
    objects.forEach((obj) => {
      obj.rotation.y = time;
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
