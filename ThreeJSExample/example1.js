import * as THREE from "three";
function main() {
  const canvas = document.getElementById("c");
  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
  });

  const fov = 75;
  const aspect = 2;
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;

  const scene = new THREE.Scene();

  const boxWidth = 1;
  const boxHeight = 1;
  const boxDepth = 1;
  const geometryCube = new THREE.BoxGeometry(boxWidth, boxHeight, boxDepth);

  const radius = 1;
  const widthSegments = 6;
  const heightSegments = 6;
  const geometrySphere = new THREE.SphereGeometry(
    radius,
    widthSegments,
    heightSegments,
  );

  const makeInstance = (geometry, color, x, y) => {
    const material = new THREE.MeshPhongMaterial({ color });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    mesh.position.x = x;
    mesh.position.y = y;
    return mesh;
  };

  const meshInstances = [
    makeInstance(geometryCube, 0x44aa88, 0, 0),
    makeInstance(geometryCube, 0x8844aa, 2, 1),
    makeInstance(geometrySphere, 0xebde34, -2, 1),
    makeInstance(geometryCube, 0xaa4488, -2, -1),
  ];

  const color = 0xffffff;
  const intensity = 3;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

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
