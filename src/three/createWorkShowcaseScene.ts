import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { createRealisticCourtyardTree, PropBuilderContext } from './architecturalProps';
import { createProceduralTextureSet } from './proceduralTextures';

export type ShowcaseWorkId =
  | 'livingroom'
  | 'kitchen'
  | 'bedroom'
  | 'booth'
  | 'floorplan'
  | 'desk'
  | 'wardrobe';
export type ShowcaseFinish = 'natural' | 'obsidian' | 'clay';

export interface WorkShowcaseOptions {
  container: HTMLElement;
  initialWork: ShowcaseWorkId;
  reducedMotion: boolean;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export interface WorkShowcaseController {
  setWork: (work: ShowcaseWorkId) => void;
  setFinish: (finish: ShowcaseFinish) => void;
  setWireframe: (enabled: boolean) => void;
  setExplode: (amount: number) => void;
  setAutoRotate: (enabled: boolean) => void;
  resetCamera: () => void;
  dispose: () => void;
}

function detectSoftwareWebGL(): boolean {
  try {
    const probeCanvas = document.createElement('canvas');
    const gl = probeCanvas.getContext('webgl2') || probeCanvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const rendererString = ext ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)) : '';
    const loseCtx = gl.getExtension('WEBGL_lose_context');
    if (loseCtx) loseCtx.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(rendererString);
  } catch {
    return false;
  }
}

interface ExplodablePart {
  object: THREE.Object3D;
  basePosition: THREE.Vector3;
  explodeVector: THREE.Vector3;
}

export function createWorkShowcaseScene(options: WorkShowcaseOptions): WorkShowcaseController {
  const { container, initialWork, reducedMotion, onContextLost, onContextRestored } = options;
  const isSoftwareGl = detectSoftwareWebGL();

  const initialWidth = Math.max(container.clientWidth || 560, 300);
  const initialHeight = Math.max(container.clientHeight || 460, 320);

  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.14;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSoftwareGl ? 1.25 : 2));
  renderer.setSize(initialWidth, initialHeight);
  renderer.shadowMap.enabled = !isSoftwareGl;
  if (!isSoftwareGl) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  renderer.domElement.style.display = 'block';
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.touchAction = 'pan-y';
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(37, initialWidth / initialHeight, 0.1, 60);
  const defaultCameraPos = new THREE.Vector3(3.95, 2.7, 4.55);
  const defaultTarget = new THREE.Vector3(0, 0.35, 0);
  camera.position.copy(defaultCameraPos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(defaultTarget);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI * 0.12;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.55;
  controls.update();

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
  scene.environment = envTarget.texture;
  roomEnv.dispose();
  pmremGenerator.dispose();

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const textures = createProceduralTextureSet(maxAnisotropy);

  const hemiLight = new THREE.HemisphereLight(0xf3edff, 0x201333, 0.95);
  scene.add(hemiLight);

  const keyLight = new THREE.DirectionalLight(0xfff2dc, 2.65);
  keyLight.position.set(5.5, 9, 6);
  if (!isSoftwareGl) {
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.near = 1;
    keyLight.shadow.camera.far = 22;
    keyLight.shadow.camera.left = -4;
    keyLight.shadow.camera.right = 4;
    keyLight.shadow.camera.top = 4;
    keyLight.shadow.camera.bottom = -4;
    keyLight.shadow.bias = -0.0006;
  }
  scene.add(keyLight);

  const rimLight = new THREE.DirectionalLight(0xc4b5fd, 1.05);
  rimLight.position.set(-5.5, 4.5, -4.5);
  scene.add(rimLight);

  const warmInteriorLight = new THREE.PointLight(0xffcf82, 2.2, 6.5, 1.5);
  warmInteriorLight.position.set(0, 1.2, 0);
  scene.add(warmInteriorLight);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const explodableParts: ExplodablePart[] = [];

  const registerGeo = <T extends THREE.BufferGeometry>(g: T): T => {
    geometries.push(g);
    return g;
  };
  const registerMat = <T extends THREE.Material>(m: T): T => {
    materials.push(m);
    return m;
  };

  const propCtx: PropBuilderContext = {
    registerGeo,
    registerMat,
    castShadow: !isSoftwareGl,
  };

  // Shared PBR Materials
  const birchWoodMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.woodDiffuse,
      bumpMap: textures.woodBump,
      bumpScale: 0.015,
      color: 0xe9cca4,
      roughness: 0.48,
      metalness: 0.04,
    })
  );
  const cherryWoodMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.woodDiffuse,
      bumpMap: textures.woodBump,
      bumpScale: 0.016,
      color: 0xc97b52,
      roughness: 0.48,
      metalness: 0.05,
    })
  );
  const walnutWoodMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.woodDiffuse,
      bumpMap: textures.woodBump,
      bumpScale: 0.014,
      color: 0x6b4125,
      roughness: 0.46,
      metalness: 0.05,
    })
  );
  const concreteWallMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.concreteDiffuse,
      bumpMap: textures.concreteBump,
      bumpScale: 0.02,
      color: 0xf0ebe2,
      roughness: 0.82,
      metalness: 0.03,
    })
  );
  const charcoalStoneWallMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.stoneDiffuse,
      bumpMap: textures.stoneBump,
      bumpScale: 0.03,
      color: 0x6e6a68,
      roughness: 0.88,
      metalness: 0.04,
    })
  );
  const tileFloorMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.tileFloorDiffuse,
      roughness: 0.22,
      metalness: 0.06,
    })
  );
  const rugMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.rugDiffuse,
      roughness: 0.94,
      metalness: 0.0,
    })
  );
  const marbleMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.marbleDiffuse,
      roughness: 0.16,
      metalness: 0.08,
    })
  );
  const steelApplianceMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x676d75,
      roughness: 0.28,
      metalness: 0.82,
    })
  );
  const brushedSteelMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xd6dae2,
      roughness: 0.2,
      metalness: 0.92,
    })
  );
  const brassMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xd4af37,
      roughness: 0.22,
      metalness: 0.92,
    })
  );
  const slateBaseMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x160e26,
      roughness: 0.45,
      metalness: 0.26,
    })
  );
  const charcoalFabricMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x35343c,
      roughness: 0.88,
      metalness: 0.02,
    })
  );
  const creamFabricMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xebe4d8,
      roughness: 0.88,
      metalness: 0.02,
    })
  );
  const sageGreenMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x4c6b58,
      roughness: 0.86,
      metalness: 0.02,
    })
  );
  const terracottaPaintMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xbe3a26,
      roughness: 0.65,
      metalness: 0.04,
    })
  );
  const accentOrangeMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xe39b24,
      roughness: 0.32,
      metalness: 0.12,
    })
  );
  const glassMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xaad4ff,
      roughness: 0.06,
      metalness: 0.24,
      transparent: true,
      opacity: 0.42,
    })
  );
  const barkMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.barkDiffuse,
      bumpMap: textures.barkBump,
      bumpScale: 0.035,
      color: 0x735c47,
      roughness: 0.94,
      metalness: 0.02,
    })
  );

  const addBox = (
    parent: THREE.Group,
    w: number,
    h: number,
    d: number,
    x: number,
    y: number,
    z: number,
    mat: THREE.Material,
    shadow = true
  ) => {
    const mesh = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(w, h, d)), mat);
    mesh.position.set(x, y, z);
    if (shadow) {
      mesh.castShadow = !isSoftwareGl;
      mesh.receiveShadow = !isSoftwareGl;
    }
    parent.add(mesh);
    return mesh;
  };

  const stageRoot = new THREE.Group();
  stageRoot.position.y = -0.58;
  scene.add(stageRoot);

  // Studio Turntable Base + Ground Contact Shadow
  const shadowGeo = registerGeo(new THREE.PlaneGeometry(5.2, 5.2));
  const shadowMat = registerMat(
    new THREE.MeshBasicMaterial({
      map: textures.contactShadow,
      transparent: true,
      depthWrite: false,
      opacity: 0.72,
    })
  );
  const contactShadow = new THREE.Mesh(shadowGeo, shadowMat);
  contactShadow.rotation.x = -Math.PI / 2;
  contactShadow.position.y = -0.15;
  stageRoot.add(contactShadow);

  const discGeo = registerGeo(new THREE.CylinderGeometry(2.38, 2.48, 0.14, 56));
  const discMesh = new THREE.Mesh(discGeo, slateBaseMat);
  discMesh.position.y = -0.07;
  discMesh.receiveShadow = !isSoftwareGl;
  stageRoot.add(discMesh);

  const rimRingGeo = registerGeo(new THREE.TorusGeometry(2.39, 0.018, 12, 72));
  const rimRing = new THREE.Mesh(rimRingGeo, brassMat);
  rimRing.rotation.x = Math.PI / 2;
  rimRing.position.y = 0.0;
  stageRoot.add(rimRing);

  // =========================================================================
  // 1. CONTEMPORARY LIVING ROOM INTERIOR (arch_interior_living.jpg)
  // =========================================================================
  const livingGroup = new THREE.Group();
  stageRoot.add(livingGroup);

  addBox(livingGroup, 3.1, 0.08, 2.7, 0, 0.04, 0, tileFloorMat);

  const livingBackGroup = new THREE.Group();
  livingGroup.add(livingBackGroup);
  addBox(livingBackGroup, 0.72, 1.55, 0.09, -1.19, 0.85, -1.3, concreteWallMat);
  addBox(livingBackGroup, 0.72, 1.55, 0.09, 1.19, 0.85, -1.3, concreteWallMat);
  addBox(livingBackGroup, 1.66, 1.52, 0.04, 0, 0.84, -1.3, glassMat, false);
  addBox(livingBackGroup, 0.42, 1.48, 0.08, -0.58, 0.82, -1.21, creamFabricMat);
  addBox(livingBackGroup, 0.42, 1.48, 0.08, 0.58, 0.82, -1.21, creamFabricMat);
  explodableParts.push({
    object: livingBackGroup,
    basePosition: livingBackGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 0.1, -0.78),
  });

  const livingLeftGroup = new THREE.Group();
  livingGroup.add(livingLeftGroup);
  addBox(livingLeftGroup, 0.09, 1.55, 2.7, -1.5, 0.85, 0, concreteWallMat);
  for (let i = 0; i < 16; i++) {
    addBox(livingLeftGroup, 0.035, 1.5, 0.045, -1.44, 0.85, -1.12 + i * 0.145, walnutWoodMat, false);
  }
  addBox(livingLeftGroup, 0.08, 0.82, 1.45, -1.39, 0.94, 0.0, creamFabricMat);
  addBox(livingLeftGroup, 0.03, 0.48, 0.84, -1.34, 0.94, -0.14, slateBaseMat, false);
  [0.78, 0.95, 1.12].forEach((sy) => {
    addBox(livingLeftGroup, 0.07, 0.02, 0.34, -1.34, sy, 0.48, glassMat, false);
  });
  addBox(livingLeftGroup, 0.34, 0.18, 2.15, -1.3, 0.17, 0, walnutWoodMat);
  addBox(livingLeftGroup, 0.36, 0.035, 2.18, -1.3, 0.28, 0, marbleMat);
  const indoorPlant = createRealisticCourtyardTree(propCtx, barkMat, 0.38);
  indoorPlant.position.set(-1.3, 0.3, -0.92);
  livingLeftGroup.add(indoorPlant);
  explodableParts.push({
    object: livingLeftGroup,
    basePosition: livingLeftGroup.position.clone(),
    explodeVector: new THREE.Vector3(-0.85, 0.08, 0),
  });

  const livingRightGroup = new THREE.Group();
  livingGroup.add(livingRightGroup);
  addBox(livingRightGroup, 0.09, 1.55, 2.7, 1.5, 0.85, 0, charcoalStoneWallMat);
  addBox(livingRightGroup, 0.035, 0.56, 0.38, 1.44, 1.02, -0.35, creamFabricMat);
  addBox(livingRightGroup, 0.035, 0.56, 0.38, 1.44, 1.02, 0.12, creamFabricMat);
  addBox(livingRightGroup, 0.045, 1.24, 0.56, 1.44, 0.7, 0.88, cherryWoodMat);
  [0.45, 0.72, 0.98].forEach((iy) => {
    addBox(livingRightGroup, 0.052, 0.02, 0.5, 1.44, iy, 0.88, brushedSteelMat, false);
  });
  explodableParts.push({
    object: livingRightGroup,
    basePosition: livingRightGroup.position.clone(),
    explodeVector: new THREE.Vector3(0.85, 0.08, 0),
  });

  const livingFurnGroup = new THREE.Group();
  livingGroup.add(livingFurnGroup);
  addBox(livingFurnGroup, 1.75, 0.02, 1.7, 0.18, 0.09, 0.08, rugMat);
  addBox(livingFurnGroup, 1.38, 0.22, 0.55, 0.36, 0.19, -0.68, charcoalFabricMat);
  addBox(livingFurnGroup, 1.38, 0.38, 0.14, 0.36, 0.34, -0.89, charcoalFabricMat);
  addBox(livingFurnGroup, 0.55, 0.22, 1.18, 0.84, 0.19, 0.18, charcoalFabricMat);
  addBox(livingFurnGroup, 0.14, 0.38, 1.18, 1.05, 0.34, 0.18, charcoalFabricMat);
  addBox(livingFurnGroup, 0.22, 0.2, 0.1, 0.72, 0.36, -0.76, creamFabricMat);
  addBox(livingFurnGroup, 0.1, 0.2, 0.22, 0.9, 0.36, -0.25, creamFabricMat);
  [
    [0.02, -0.02, 0.26, 0.2],
    [-0.18, 0.24, 0.22, 0.16],
    [0.24, 0.22, 0.17, 0.24],
  ].forEach(([tx, tz, rad, th]) => {
    const tbl = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(rad, rad, 0.025, 24)), brassMat);
    tbl.position.set(tx, 0.1 + th, tz);
    livingFurnGroup.add(tbl);
    const frame = new THREE.Mesh(
      registerGeo(new THREE.CylinderGeometry(rad * 0.82, rad * 0.82, th, 20, 1, true)),
      brassMat
    );
    frame.position.set(tx, 0.1 + th / 2, tz);
    livingFurnGroup.add(frame);
  });
  const sideTop = new THREE.Mesh(
    registerGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 20)),
    walnutWoodMat
  );
  sideTop.position.set(0.84, 0.38, 0.96);
  livingFurnGroup.add(sideTop);
  const lamp = new THREE.Mesh(
    registerGeo(new THREE.CylinderGeometry(0.09, 0.11, 0.18, 18)),
    creamFabricMat
  );
  lamp.position.set(0.84, 0.56, 0.96);
  livingFurnGroup.add(lamp);

  const livingCeilingGroup = new THREE.Group();
  livingGroup.add(livingCeilingGroup);
  addBox(livingCeilingGroup, 3.1, 0.08, 2.7, 0, 1.66, 0, concreteWallMat);
  addBox(livingCeilingGroup, 2.05, 0.08, 1.75, 0, 1.59, 0, creamFabricMat);
  [0.42, 0.32, 0.22].forEach((r, idx) => {
    const ring = new THREE.Mesh(
      registerGeo(new THREE.TorusGeometry(r, 0.018, 12, 42)),
      brushedSteelMat
    );
    ring.position.set(0, 1.44 - idx * 0.075, -0.05);
    ring.rotation.set(Math.PI / 2 + (idx - 1) * 0.16, idx * 0.2, 0);
    livingCeilingGroup.add(ring);
  });
  explodableParts.push({
    object: livingCeilingGroup,
    basePosition: livingCeilingGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 1.15, 0),
  });

  // =========================================================================
  // 2. MODERN WALNUT & MARBLE KITCHEN (kitchen.jpg)
  // =========================================================================
  const kitchenGroup = new THREE.Group();
  stageRoot.add(kitchenGroup);

  addBox(kitchenGroup, 3.2, 0.08, 2.55, 0, 0.04, 0, marbleMat);

  // Back & Side Kitchen Walls with Venetian Blind Window
  const kitchenBackGroup = new THREE.Group();
  kitchenGroup.add(kitchenBackGroup);
  addBox(kitchenBackGroup, 3.2, 1.58, 0.1, 0, 0.87, -1.22, marbleMat);
  addBox(kitchenBackGroup, 0.1, 1.58, 2.5, -1.55, 0.87, 0, marbleMat);
  addBox(kitchenBackGroup, 0.1, 1.58, 2.5, 1.55, 0.87, 0, concreteWallMat);
  addBox(kitchenBackGroup, 0.04, 0.65, 1.15, 1.49, 1.06, 0.15, charcoalFabricMat);
  for (let b = 0; b < 8; b++) {
    addBox(kitchenBackGroup, 0.05, 0.018, 1.1, 1.47, 0.8 + b * 0.075, 0.15, brushedSteelMat, false);
  }
  explodableParts.push({
    object: kitchenBackGroup,
    basePosition: kitchenBackGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 0.1, -0.78),
  });

  // Left Appliance Wall (Double-Door Fridge + Oven/Microwave Tower) + Lower Cabinets
  const kitchenCabinetsGroup = new THREE.Group();
  kitchenGroup.add(kitchenCabinetsGroup);
  // Double-door Steel Refrigerator
  addBox(kitchenCabinetsGroup, 0.62, 1.24, 0.56, -1.16, 0.7, -0.88, steelApplianceMat);
  addBox(kitchenCabinetsGroup, 0.025, 0.62, 0.03, -1.19, 0.75, -0.59, brushedSteelMat);
  addBox(kitchenCabinetsGroup, 0.025, 0.62, 0.03, -1.12, 0.75, -0.59, brushedSteelMat);
  // Walnut Tall Oven Tower + Built-in Microwave & Oven
  addBox(kitchenCabinetsGroup, 0.54, 1.5, 0.56, -0.56, 0.83, -0.88, walnutWoodMat);
  addBox(kitchenCabinetsGroup, 0.42, 0.22, 0.04, -0.56, 1.04, -0.59, brushedSteelMat);
  addBox(kitchenCabinetsGroup, 0.42, 0.3, 0.04, -0.56, 0.72, -0.59, slateBaseMat);
  // Walnut Lower Cabinets + Cream Marble Countertop along Back & Right L-Return
  addBox(kitchenCabinetsGroup, 1.75, 0.52, 0.54, 0.6, 0.34, -0.88, walnutWoodMat);
  addBox(kitchenCabinetsGroup, 1.78, 0.05, 0.57, 0.6, 0.62, -0.88, marbleMat);
  addBox(kitchenCabinetsGroup, 0.54, 0.52, 1.45, 1.22, 0.34, 0.12, walnutWoodMat);
  addBox(kitchenCabinetsGroup, 0.57, 0.05, 1.48, 1.22, 0.62, 0.12, marbleMat);
  // Stovetop + Stainless Faucet
  addBox(kitchenCabinetsGroup, 0.52, 0.02, 0.36, 0.38, 0.65, -0.88, slateBaseMat);
  addBox(kitchenCabinetsGroup, 0.38, 0.03, 0.34, 1.22, 0.65, 0.15, slateBaseMat);
  addBox(kitchenCabinetsGroup, 0.03, 0.2, 0.03, 1.38, 0.75, 0.15, brushedSteelMat);

  // Glossy Charcoal Upper Cabinets + Illuminated Glass Spice Cabinets (lift up on Explode)
  const kitchenUpperGroup = new THREE.Group();
  kitchenGroup.add(kitchenUpperGroup);
  addBox(kitchenUpperGroup, 1.15, 0.46, 0.32, 0.3, 1.28, -0.98, charcoalFabricMat);
  addBox(kitchenUpperGroup, 0.58, 0.46, 0.3, 1.18, 1.28, -0.98, glassMat, false);
  addBox(kitchenUpperGroup, 0.58, 0.02, 0.26, 1.18, 1.28, -0.98, walnutWoodMat);
  // False Ceiling + Track Lighting
  addBox(kitchenUpperGroup, 3.2, 0.08, 2.55, 0, 1.7, 0, concreteWallMat);
  addBox(kitchenUpperGroup, 2.2, 0.04, 0.06, -0.1, 1.63, -0.35, charcoalFabricMat);
  explodableParts.push({
    object: kitchenUpperGroup,
    basePosition: kitchenUpperGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 1.15, 0),
  });

  // =========================================================================
  // 3. MASTER GARDEN BEDROOM SUITE (room.jpg)
  // =========================================================================
  const bedroomGroup = new THREE.Group();
  stageRoot.add(bedroomGroup);

  addBox(bedroomGroup, 3.15, 0.08, 2.65, 0, 0.04, 0, walnutWoodMat);

  // Headboard Wall + Triptych Paintings + Dark Espresso Feature Panel
  const bedroomBackGroup = new THREE.Group();
  bedroomGroup.add(bedroomBackGroup);
  addBox(bedroomBackGroup, 3.15, 1.56, 0.1, 0, 0.86, -1.28, concreteWallMat);
  addBox(bedroomBackGroup, 2.65, 0.82, 0.06, -0.18, 0.49, -1.2, charcoalFabricMat);
  [-0.78, -0.22, 0.34].forEach((px, idx) => {
    addBox(bedroomBackGroup, 0.36, 0.36, 0.03, px, 1.22, -1.21, charcoalFabricMat);
    addBox(
      bedroomBackGroup,
      0.28,
      0.28,
      0.04,
      px,
      1.22,
      -1.2,
      idx === 1 ? terracottaPaintMat : accentOrangeMat,
      false
    );
  });
  explodableParts.push({
    object: bedroomBackGroup,
    basePosition: bedroomBackGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 0.08, -0.78),
  });

  // Wide 4-Panel Black-Framed Sliding Garden Glass Wall (Right Side)
  const bedroomGlassGroup = new THREE.Group();
  bedroomGroup.add(bedroomGlassGroup);
  addBox(bedroomGlassGroup, 0.06, 1.48, 2.5, 1.52, 0.82, 0, glassMat, false);
  [-1.2, -0.4, 0.4, 1.2].forEach((mz) => {
    addBox(bedroomGlassGroup, 0.08, 1.5, 0.06, 1.52, 0.83, mz, slateBaseMat);
  });
  explodableParts.push({
    object: bedroomGlassGroup,
    basePosition: bedroomGlassGroup.position.clone(),
    explodeVector: new THREE.Vector3(0.85, 0.08, 0),
  });

  // Birch Platform Bed + Sage-Green Duvet & Pillows + Nightstands + Bench + Armchair
  const bedroomFurnGroup = new THREE.Group();
  bedroomGroup.add(bedroomFurnGroup);
  addBox(bedroomFurnGroup, 1.45, 0.22, 1.55, -0.22, 0.19, -0.45, birchWoodMat);
  addBox(bedroomFurnGroup, 1.45, 0.62, 0.07, -0.22, 0.42, -1.16, birchWoodMat);
  addBox(bedroomFurnGroup, 1.32, 0.14, 1.42, -0.22, 0.36, -0.45, charcoalFabricMat);
  addBox(bedroomFurnGroup, 1.34, 0.06, 0.98, -0.22, 0.44, -0.22, sageGreenMat);
  addBox(bedroomFurnGroup, 0.48, 0.1, 0.3, -0.52, 0.46, -0.94, sageGreenMat);
  addBox(bedroomFurnGroup, 0.48, 0.1, 0.3, 0.08, 0.46, -0.94, sageGreenMat);
  // Twin Birch Nightstands + Glowing Lamps
  [-1.16, 0.72].forEach((nx) => {
    addBox(bedroomFurnGroup, 0.34, 0.28, 0.34, nx, 0.22, -1.04, birchWoodMat);
    const shade = new THREE.Mesh(
      registerGeo(new THREE.CylinderGeometry(0.09, 0.13, 0.16, 16)),
      sageGreenMat
    );
    shade.position.set(nx, 0.54, -1.04);
    bedroomFurnGroup.add(shade);
  });
  // Foot-of-Bed Birch Bench + Charcoal Lounge Chair
  addBox(bedroomFurnGroup, 1.24, 0.2, 0.38, -0.22, 0.18, 0.65, birchWoodMat);
  addBox(bedroomFurnGroup, 0.6, 0.24, 0.6, 1.04, 0.2, 0.58, charcoalFabricMat);
  addBox(bedroomFurnGroup, 0.6, 0.36, 0.12, 1.04, 0.42, 0.82, charcoalFabricMat);

  // Recessed Bedroom Ceiling + 5-Blade Chrome Ceiling Fan (lifts upward on Explode)
  const bedroomCeilingGroup = new THREE.Group();
  bedroomGroup.add(bedroomCeilingGroup);
  addBox(bedroomCeilingGroup, 3.15, 0.08, 2.65, 0, 1.66, 0, concreteWallMat);
  const fanHub = new THREE.Mesh(
    registerGeo(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16)),
    brushedSteelMat
  );
  fanHub.position.set(0, 1.54, 0);
  bedroomCeilingGroup.add(fanHub);
  for (let b = 0; b < 5; b++) {
    const blade = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.46, 0.015, 0.1)), charcoalFabricMat);
    const angle = (b / 5) * Math.PI * 2;
    blade.position.set(Math.cos(angle) * 0.26, 1.53, Math.sin(angle) * 0.26);
    blade.rotation.y = -angle;
    bedroomCeilingGroup.add(blade);
  }
  explodableParts.push({
    object: bedroomCeilingGroup,
    basePosition: bedroomCeilingGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 1.15, 0),
  });

  // =========================================================================
  // 4. CORPORATE EXHIBITION & RECEPTION BOOTH (arch_office_reception.jpg)
  // =========================================================================
  const boothGroup = new THREE.Group();
  stageRoot.add(boothGroup);

  addBox(boothGroup, 3.2, 0.08, 1.95, 0, 0.04, 0, birchWoodMat);

  const boothBackGroup = new THREE.Group();
  boothGroup.add(boothBackGroup);
  addBox(boothBackGroup, 0.09, 1.48, 1.9, -1.55, 0.78, 0, creamFabricMat);
  addBox(boothBackGroup, 3.16, 1.48, 0.09, 0, 0.78, -0.92, creamFabricMat);
  addBox(boothBackGroup, 0.85, 0.56, 0.06, 0.92, 0.94, -0.85, accentOrangeMat);
  addBox(boothBackGroup, 0.68, 0.42, 0.07, 0.92, 0.94, -0.83, slateBaseMat, false);
  addBox(boothBackGroup, 0.34, 0.44, 0.05, -0.22, 0.94, -0.85, accentOrangeMat);
  addBox(boothBackGroup, 0.34, 0.44, 0.05, 0.18, 0.94, -0.85, accentOrangeMat);
  addBox(boothBackGroup, 1.08, 0.32, 0.12, 0.38, 1.48, -0.82, creamFabricMat);
  explodableParts.push({
    object: boothBackGroup,
    basePosition: boothBackGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 0.1, -0.78),
  });

  const boothRoofGroup = new THREE.Group();
  boothGroup.add(boothRoofGroup);
  for (let i = 0; i < 6; i++) {
    addBox(boothRoofGroup, 0.05, 0.08, 1.85, -1.5 + i * 0.25, 1.56, 0, birchWoodMat);
  }
  for (let j = 0; j < 6; j++) {
    addBox(boothRoofGroup, 1.35, 0.08, 0.05, -0.88, 1.56, -0.85 + j * 0.34, birchWoodMat);
  }
  [-0.35, 0, 0.35].forEach((pz) => {
    const pendant = new THREE.Mesh(
      registerGeo(new THREE.CylinderGeometry(0.055, 0.055, 0.16, 14)),
      creamFabricMat
    );
    pendant.position.set(-0.88, 1.32, pz);
    boothRoofGroup.add(pendant);
  });
  explodableParts.push({
    object: boothRoofGroup,
    basePosition: boothRoofGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 1.15, 0),
  });

  const boothFrontGroup = new THREE.Group();
  boothGroup.add(boothFrontGroup);
  addBox(boothFrontGroup, 0.72, 0.26, 0.38, -0.98, 0.21, -0.58, creamFabricMat);
  addBox(boothFrontGroup, 0.42, 0.08, 0.28, -0.95, 0.14, 0.05, creamFabricMat);
  addBox(boothFrontGroup, 0.78, 0.54, 0.42, 0.92, 0.35, 0.62, creamFabricMat);
  addBox(boothFrontGroup, 0.65, 0.42, 0.44, 0.92, 0.31, 0.65, glassMat, false);
  explodableParts.push({
    object: boothFrontGroup,
    basePosition: boothFrontGroup.position.clone(),
    explodeVector: new THREE.Vector3(0.42, 0.12, 0.68),
  });

  // =========================================================================
  // 5. 3D COMMERCIAL OFFICE FLOOR PLAN (floor_plan_3d.jpg)
  // =========================================================================
  const floorPlanGroup = new THREE.Group();
  stageRoot.add(floorPlanGroup);

  addBox(floorPlanGroup, 3.3, 0.08, 2.35, 0, 0.04, 0, birchWoodMat);
  addBox(floorPlanGroup, 1.15, 0.02, 0.85, 0.05, 0.09, 0.68, tileFloorMat);

  const fpWallsGroup = new THREE.Group();
  floorPlanGroup.add(fpWallsGroup);
  addBox(fpWallsGroup, 3.3, 0.56, 0.08, 0, 0.34, -1.14, concreteWallMat);
  addBox(fpWallsGroup, 0.08, 0.56, 2.35, -1.61, 0.34, 0, concreteWallMat);
  addBox(fpWallsGroup, 0.08, 0.56, 2.35, 1.61, 0.34, 0, concreteWallMat);
  addBox(fpWallsGroup, 3.3, 0.56, 0.08, 0, 0.34, 1.14, concreteWallMat);
  addBox(fpWallsGroup, 0.07, 0.54, 1.35, -0.45, 0.33, -0.44, concreteWallMat);
  addBox(fpWallsGroup, 1.15, 0.54, 0.07, -1.04, 0.33, 0.24, concreteWallMat);
  addBox(fpWallsGroup, 0.07, 0.54, 1.45, 0.62, 0.33, -0.4, concreteWallMat);
  explodableParts.push({
    object: fpWallsGroup,
    basePosition: fpWallsGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 0.98, 0),
  });

  const fpFurnGroup = new THREE.Group();
  floorPlanGroup.add(fpFurnGroup);
  addBox(fpFurnGroup, 0.88, 0.04, 0.56, -1.04, 0.26, -0.58, walnutWoodMat);
  [-1.32, -1.04, -0.76].forEach((cx) => {
    addBox(fpFurnGroup, 0.14, 0.18, 0.14, cx, 0.18, -0.94, charcoalFabricMat);
    addBox(fpFurnGroup, 0.14, 0.18, 0.14, cx, 0.18, -0.22, charcoalFabricMat);
  });
  [
    [-0.1, -0.35],
    [0.25, -0.35],
    [-0.1, 0.08],
    [0.25, 0.08],
  ].forEach(([dx, dz]) => {
    addBox(fpFurnGroup, 0.3, 0.04, 0.22, dx, 0.24, dz, creamFabricMat);
    addBox(fpFurnGroup, 0.12, 0.16, 0.12, dx, 0.17, dz + 0.18, charcoalFabricMat);
  });
  addBox(fpFurnGroup, 0.2, 0.38, 0.72, -1.42, 0.27, 0.68, walnutWoodMat);
  addBox(fpFurnGroup, 0.78, 0.38, 0.2, -1.05, 0.27, 0.96, birchWoodMat);
  addBox(fpFurnGroup, 0.62, 0.28, 0.24, -0.08, 0.22, 0.72, birchWoodMat);
  addBox(fpFurnGroup, 0.45, 0.18, 0.22, 0.38, 0.17, 0.42, charcoalFabricMat);
  addBox(fpFurnGroup, 0.36, 0.04, 1.38, 1.15, 0.25, -0.22, cherryWoodMat);
  const fpPlant = createRealisticCourtyardTree(propCtx, barkMat, 0.28, textures.leafClusterAlpha);
  fpPlant.position.set(-1.45, 0.08, -0.96);
  fpFurnGroup.add(fpPlant);
  explodableParts.push({
    object: fpFurnGroup,
    basePosition: fpFurnGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 0.42, 0),
  });

  // =========================================================================
  // 6. 3-DRAWER BIRCH STORAGE CREDENZA (furniture_computer_table_3d.jpg)
  // =========================================================================
  const deskGroup = new THREE.Group();
  stageRoot.add(deskGroup);

  addBox(deskGroup, 2.38, 0.07, 1.18, 0, 0.08, 0, birchWoodMat);
  addBox(deskGroup, 0.06, 1.06, 1.14, -1.16, 0.62, 0, birchWoodMat);
  addBox(deskGroup, 0.06, 1.06, 1.14, -0.32, 0.62, 0, birchWoodMat);
  addBox(deskGroup, 0.06, 1.06, 1.14, 0.56, 0.62, 0, birchWoodMat);
  addBox(deskGroup, 0.06, 1.06, 1.14, 1.16, 0.62, 0, birchWoodMat);
  addBox(deskGroup, 2.34, 1.06, 0.05, 0, 0.62, -0.56, birchWoodMat);

  const deskTopGroup = new THREE.Group();
  deskGroup.add(deskTopGroup);
  addBox(deskTopGroup, 2.42, 0.07, 1.2, 0, 1.18, 0, birchWoodMat);
  explodableParts.push({
    object: deskTopGroup,
    basePosition: deskTopGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 0.68, 0),
  });

  const deskShelfGroup = new THREE.Group();
  deskGroup.add(deskShelfGroup);
  addBox(deskShelfGroup, 0.84, 0.05, 1.08, 0.12, 0.62, -0.01, birchWoodMat);
  explodableParts.push({
    object: deskShelfGroup,
    basePosition: deskShelfGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 0.15, 0.55),
  });

  [0.27, 0.62, 0.97].forEach((dy, idx) => {
    const drawerGroup = new THREE.Group();
    deskGroup.add(drawerGroup);
    addBox(drawerGroup, 0.76, 0.32, 0.05, -0.74, dy, 0.58, birchWoodMat);
    addBox(drawerGroup, 0.7, 0.2, 0.92, -0.74, dy - 0.03, 0.09, walnutWoodMat);
    addBox(drawerGroup, 0.24, 0.03, 0.04, -0.74, dy + 0.02, 0.62, brushedSteelMat);
    explodableParts.push({
      object: drawerGroup,
      basePosition: drawerGroup.position.clone(),
      explodeVector: new THREE.Vector3(0, 0.06, 0.45 + idx * 0.32),
    });
  });

  const deskDoorGroup = new THREE.Group();
  deskGroup.add(deskDoorGroup);
  addBox(deskDoorGroup, 0.56, 1.02, 0.05, 0.86, 0.62, 0.58, birchWoodMat);
  addBox(deskDoorGroup, 0.22, 0.03, 0.04, 0.86, 0.98, 0.62, brushedSteelMat);
  explodableParts.push({
    object: deskDoorGroup,
    basePosition: deskDoorGroup.position.clone(),
    explodeVector: new THREE.Vector3(0.45, 0.08, 0.72),
  });

  // =========================================================================
  // 7. TALL TIMBER 6-TIER BOOKCASE (furniture_wardrobe_3d.jpg)
  // =========================================================================
  const wardrobeGroup = new THREE.Group();
  stageRoot.add(wardrobeGroup);

  addBox(wardrobeGroup, 1.18, 0.12, 0.74, 0, 0.06, 0, cherryWoodMat);
  addBox(wardrobeGroup, 0.06, 2.38, 0.78, -0.56, 1.25, 0, cherryWoodMat);
  addBox(wardrobeGroup, 0.06, 2.38, 0.78, 0.56, 1.25, 0, cherryWoodMat);

  const bookcaseBackGroup = new THREE.Group();
  wardrobeGroup.add(bookcaseBackGroup);
  addBox(bookcaseBackGroup, 1.14, 2.36, 0.05, 0, 1.25, -0.37, cherryWoodMat);
  explodableParts.push({
    object: bookcaseBackGroup,
    basePosition: bookcaseBackGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 0, -0.68),
  });

  const bookcaseTopGroup = new THREE.Group();
  wardrobeGroup.add(bookcaseTopGroup);
  addBox(bookcaseTopGroup, 1.24, 0.065, 0.82, 0, 2.47, 0.01, cherryWoodMat);
  explodableParts.push({
    object: bookcaseTopGroup,
    basePosition: bookcaseTopGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 0.65, 0),
  });

  [0.52, 0.92, 1.32, 1.72, 2.12].forEach((sy, idx) => {
    const shelfGroup = new THREE.Group();
    wardrobeGroup.add(shelfGroup);
    addBox(shelfGroup, 1.06, 0.05, 0.72, 0, sy, 0.01, cherryWoodMat);
    explodableParts.push({
      object: shelfGroup,
      basePosition: shelfGroup.position.clone(),
      explodeVector: new THREE.Vector3(0, 0.08 * idx, 0.45 + idx * 0.14),
    });
  });

  const workGroups: Record<ShowcaseWorkId, THREE.Group> = {
    livingroom: livingGroup,
    kitchen: kitchenGroup,
    bedroom: bedroomGroup,
    booth: boothGroup,
    floorplan: floorPlanGroup,
    desk: deskGroup,
    wardrobe: wardrobeGroup,
  };

  let activeWork: ShowcaseWorkId = initialWork;
  const applyActiveWork = (work: ShowcaseWorkId) => {
    activeWork = work;
    (Object.keys(workGroups) as ShowcaseWorkId[]).forEach((key) => {
      workGroups[key].visible = key === work;
    });
  };
  applyActiveWork(initialWork);

  const applyFinish = (finish: ShowcaseFinish) => {
    if (finish === 'natural') {
      concreteWallMat.map = textures.concreteDiffuse;
      concreteWallMat.color.setHex(0xf0ebe2);
      charcoalStoneWallMat.map = textures.stoneDiffuse;
      charcoalStoneWallMat.color.setHex(0x6e6a68);
      birchWoodMat.map = textures.woodDiffuse;
      birchWoodMat.color.setHex(0xe9cca4);
      cherryWoodMat.map = textures.woodDiffuse;
      cherryWoodMat.color.setHex(0xc97b52);
      cherryWoodMat.metalness = 0.05;
      warmInteriorLight.intensity = 2.2;
    } else if (finish === 'obsidian') {
      concreteWallMat.map = textures.concreteDiffuse;
      concreteWallMat.color.setHex(0x2b1d45);
      charcoalStoneWallMat.map = textures.stoneDiffuse;
      charcoalStoneWallMat.color.setHex(0x1f1533);
      birchWoodMat.map = null;
      birchWoodMat.color.setHex(0xd4af37);
      cherryWoodMat.map = null;
      cherryWoodMat.color.setHex(0xd4af37);
      cherryWoodMat.metalness = 0.85;
      warmInteriorLight.intensity = 2.8;
    } else {
      concreteWallMat.map = null;
      concreteWallMat.color.setHex(0xede9e1);
      charcoalStoneWallMat.map = null;
      charcoalStoneWallMat.color.setHex(0xd4cfc7);
      birchWoodMat.map = null;
      birchWoodMat.color.setHex(0xdfd9cf);
      cherryWoodMat.map = null;
      cherryWoodMat.color.setHex(0xcbc4b9);
      cherryWoodMat.metalness = 0.02;
      warmInteriorLight.intensity = 0.9;
    }
    concreteWallMat.needsUpdate = true;
    charcoalStoneWallMat.needsUpdate = true;
    birchWoodMat.needsUpdate = true;
    cherryWoodMat.needsUpdate = true;
  };

  let targetExplode = 0;
  let currentExplode = 0;
  let resetPending = false;
  const _tempVec = new THREE.Vector3();

  let isInView = true;
  let isTabVisible = !document.hidden;
  let isDisposed = false;
  let rafId = 0;
  let pacingTimer = 0;
  let lastTimestamp = performance.now();

  const intersectionObserver = new IntersectionObserver(
    (entries) => {
      isInView = entries[0]?.isIntersecting ?? true;
    },
    { threshold: 0.04 }
  );
  intersectionObserver.observe(container);

  const onVisibilityChange = () => {
    isTabVisible = !document.hidden;
    lastTimestamp = performance.now();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);

  const resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (!entry) return;
    const width = Math.max(Math.floor(entry.contentRect.width), 280);
    const height = Math.max(Math.floor(entry.contentRect.height), 280);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
  });
  resizeObserver.observe(container);

  const handleContextLost = (event: Event) => {
    event.preventDefault();
    onContextLost?.();
  };
  const handleContextRestored = () => {
    onContextRestored?.();
  };
  renderer.domElement.addEventListener('webglcontextlost', handleContextLost);
  renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored);

  const scheduleNextFrame = () => {
    if (isDisposed) return;
    if (isSoftwareGl) {
      pacingTimer = window.setTimeout(() => {
        if (!isDisposed) rafId = window.requestAnimationFrame(tick);
      }, 32);
    } else {
      rafId = window.requestAnimationFrame(tick);
    }
  };

  const tick = (now: number) => {
    if (isDisposed) return;
    const rawDt = (now - lastTimestamp) / 1000;
    lastTimestamp = now;
    const dt = Math.min(Math.max(rawDt, 0.001), 0.1);

    if (isInView && isTabVisible) {
      currentExplode = THREE.MathUtils.damp(currentExplode, targetExplode, 6, dt);
      for (let i = 0; i < explodableParts.length; i++) {
        const part = explodableParts[i];
        _tempVec.copy(part.explodeVector).multiplyScalar(currentExplode);
        part.object.position.copy(part.basePosition).add(_tempVec);
      }

      if (resetPending) {
        camera.position.x = THREE.MathUtils.damp(camera.position.x, defaultCameraPos.x, 6, dt);
        camera.position.y = THREE.MathUtils.damp(camera.position.y, defaultCameraPos.y, 6, dt);
        camera.position.z = THREE.MathUtils.damp(camera.position.z, defaultCameraPos.z, 6, dt);
        controls.target.x = THREE.MathUtils.damp(controls.target.x, defaultTarget.x, 6, dt);
        controls.target.y = THREE.MathUtils.damp(controls.target.y, defaultTarget.y, 6, dt);
        controls.target.z = THREE.MathUtils.damp(controls.target.z, defaultTarget.z, 6, dt);
        if (camera.position.distanceTo(defaultCameraPos) < 0.03) {
          camera.position.copy(defaultCameraPos);
          controls.target.copy(defaultTarget);
          resetPending = false;
        }
      }

      controls.update();
      renderer.render(scene, camera);
    }

    scheduleNextFrame();
  };

  renderer.render(scene, camera);
  rafId = window.requestAnimationFrame(tick);

  return {
    setWork: (work) => {
      if (activeWork !== work) {
        applyActiveWork(work);
      }
    },
    setFinish: (finish) => {
      applyFinish(finish);
    },
    setWireframe: (enabled) => {
      concreteWallMat.wireframe = enabled;
      charcoalStoneWallMat.wireframe = enabled;
      birchWoodMat.wireframe = enabled;
      cherryWoodMat.wireframe = enabled;
      walnutWoodMat.wireframe = enabled;
      charcoalFabricMat.wireframe = enabled;
      creamFabricMat.wireframe = enabled;
    },
    setExplode: (amount) => {
      targetExplode = Math.min(1, Math.max(0, amount));
    },
    setAutoRotate: (enabled) => {
      controls.autoRotate = enabled && !reducedMotion;
    },
    resetCamera: () => {
      resetPending = true;
    },
    dispose: () => {
      isDisposed = true;
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(pacingTimer);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);

      controls.dispose();
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.dispose();
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    },
  };
}
