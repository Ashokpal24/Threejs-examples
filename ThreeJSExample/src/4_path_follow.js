import * as THREE from "three";
import { Wireframe } from "three/examples/jsm/Addons";
function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
  });
  renderer.shadowMap.enabled = true; // important
  const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 75);
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);

  const scene = new THREE.Scene();
  const light = new THREE.DirectionalLight(0xffffff, 3);
  light.position.set(2, 20, 0);
  scene.add(light);
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

  const radius = 2;
  const widthSegments = 6;
  const heightSegments = 6;
  const spherePosition = new THREE.Vector2();
  const sphereTarget = new THREE.Vector2();
  const sphereGeometry = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments,
  );
  const sphereMaterial = new THREE.MeshPhongMaterial({
    color: "red",
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away
    polygonOffsetUnits: 1,
  });
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.position.set(0, radius, 0);
  sphereMesh.castShadow = true;

  //   Adding Wireframe to sphere mesh
  const lineGeometry = new THREE.EdgesGeometry(sphereMesh.geometry);
  const lineMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  sphereMesh.add(lineMesh);

  const axes = new THREE.AxesHelper();
  axes.material.depthTest = false;
  axes.renderOrder = 1;
  sphereMesh.add(axes);

  scene.add(sphereMesh);

  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshPhongMaterial({
    color: "green",
  });
  const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = Math.PI * -0.5;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);

  const curve = new THREE.SplineCurve([
    new THREE.Vector2(-10, 0),
    new THREE.Vector2(-5, 5),
    new THREE.Vector2(0, 0),
    new THREE.Vector2(5, -5),
    new THREE.Vector2(10, 0),
    new THREE.Vector2(5, 10),
    new THREE.Vector2(-5, 10),
    new THREE.Vector2(-10, -10),
    new THREE.Vector2(-15, -8),
    new THREE.Vector2(-10, 0),
  ]);

  const points = curve.getPoints(50);
  console.log(points);
  const splineGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const splineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
  const splineObject = new THREE.Line(splineGeometry, splineMaterial);
  splineObject.rotation.x = Math.PI * 0.5;
  splineObject.position.set(0, 0.05, 0);
  scene.add(splineObject);

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

    const sphereTime = time * 0.05;
    curve.getPointAt(sphereTime % 1, spherePosition);
    curve.getPointAt((sphereTime + 0.01) % 1, sphereTarget);
    sphereMesh.position.set(spherePosition.x, radius, spherePosition.y);
    sphereMesh.lookAt(sphereTarget.x, radius, sphereTarget.y);

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
