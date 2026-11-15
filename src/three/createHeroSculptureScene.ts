import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createRealisticCourtyardTree,
  createRealisticLuxurySedan,
  createRealisticPalmTree,
  PropBuilderContext,
} from './architecturalProps';
import { createProceduralTextureSet } from './proceduralTextures';

export type SculptureFinish = 'natural' | 'obsidian' | 'clay';

export interface HeroSceneOptions {
  container: HTMLElement;
  reducedMotion: boolean;
  onContextLost?: () => void;
  onContextRestored?: () => void;
}

export interface HeroSceneController {
  setFinish: (finish: SculptureFinish) => void;
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

function createRoundedSlabGeo(width: number, depth: number, thickness: number, radius: number) {
  const hw = width / 2;
  const hd = depth / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hw + radius, -hd);
  shape.lineTo(hw - radius, -hd);
  shape.quadraticCurveTo(hw, -hd, hw, -hd + radius);
  shape.lineTo(hw, hd - radius);
  shape.quadraticCurveTo(hw, hd, hw - radius, hd);
  shape.lineTo(-hw + radius, hd);
  shape.quadraticCurveTo(-hw, hd, -hw, hd - radius);
  shape.lineTo(-hw, -hd + radius);
  shape.quadraticCurveTo(-hw, -hd, -hw + radius, -hd);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.025,
    bevelThickness: 0.025,
  });
  geo.rotateX(-Math.PI / 2);
  geo.center();
  return geo;
}

function createGableRoofGeo(width: number, depth: number, height: number) {
  const hw = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, 0);
  shape.lineTo(0, height);
  shape.lineTo(hw, 0);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: false,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

/**
 * Extrudes an architectural wall facade with a true semicircular arch cutout
 * centered horizontally, used for the Garage Porte-Cochere and Entry Portico.
 */
function createArchedFacadeGeo(
  width: number,
  height: number,
  depth: number,
  archRadius: number,
  archSpringY: number
) {
  const hw = width / 2;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, 0);
  shape.lineTo(-archRadius, 0);
  shape.lineTo(-archRadius, archSpringY);
  shape.absarc(0, archSpringY, archRadius, Math.PI, 0, true);
  shape.lineTo(archRadius, 0);
  shape.lineTo(hw, 0);
  shape.lineTo(hw, height);
  shape.lineTo(-hw, height);
  shape.closePath();

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelSegments: 2,
    bevelSize: 0.012,
    bevelThickness: 0.012,
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

export function createHeroSculptureScene(options: HeroSceneOptions): HeroSceneController {
  const { container, reducedMotion, onContextLost, onContextRestored } = options;
  const isSoftwareGl = detectSoftwareWebGL();

  const initialWidth = Math.max(container.clientWidth || 640, 320);
  const initialHeight = Math.max(container.clientHeight || 480, 320);

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
  scene.fog = new THREE.FogExp2(0x130a24, 0.013);

  const camera = new THREE.PerspectiveCamera(36, initialWidth / initialHeight, 0.1, 90);
  const defaultCameraPos = new THREE.Vector3(8.5, 5.35, 9.75);
  const defaultTarget = new THREE.Vector3(0.0, 0.85, 0.0);
  camera.position.copy(defaultCameraPos);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(defaultTarget);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = false;
  controls.enableZoom = false;
  controls.minPolarAngle = Math.PI * 0.14;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.autoRotate = !reducedMotion;
  controls.autoRotateSpeed = 0.42;
  controls.update();

  const pmremGenerator = new THREE.PMREMGenerator(renderer);
  const roomEnv = new RoomEnvironment();
  const envTarget = pmremGenerator.fromScene(roomEnv, 0.04);
  scene.environment = envTarget.texture;
  roomEnv.dispose();
  pmremGenerator.dispose();

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
  const textures = createProceduralTextureSet(maxAnisotropy);

  // Studio Daylight + Interior Floor Glow + Porch Accent
  const hemiLight = new THREE.HemisphereLight(0xf3eeff, 0x241736, 1.0);
  scene.add(hemiLight);

  const sunLight = new THREE.DirectionalLight(0xfff1d6, 2.8);
  sunLight.position.set(11, 15, 10.5);
  if (!isSoftwareGl) {
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.set(1024, 1024);
    sunLight.shadow.camera.near = 2;
    sunLight.shadow.camera.far = 36;
    sunLight.shadow.camera.left = -7.2;
    sunLight.shadow.camera.right = 7.2;
    sunLight.shadow.camera.top = 7.2;
    sunLight.shadow.camera.bottom = -7.2;
    sunLight.shadow.bias = -0.0006;
  }
  scene.add(sunLight);

  const fillLight = new THREE.DirectionalLight(0xc2b2ff, 0.95);
  fillLight.position.set(-9, 7, -7);
  scene.add(fillLight);

  const groundInteriorLight = new THREE.PointLight(0xffd28c, 2.8, 9.0, 1.35);
  groundInteriorLight.position.set(0.35, 0.95, -0.35);
  scene.add(groundInteriorLight);

  const upperInteriorLight = new THREE.PointLight(0xffdca3, 2.5, 8.5, 1.4);
  upperInteriorLight.position.set(0.35, 2.45, -0.45);
  scene.add(upperInteriorLight);

  const geometries: THREE.BufferGeometry[] = [];
  const materials: THREE.Material[] = [];
  const explodableParts: ExplodablePart[] = [];

  const registerGeo = <T extends THREE.BufferGeometry>(geo: T): T => {
    geometries.push(geo);
    return geo;
  };
  const registerMat = <T extends THREE.Material>(mat: T): T => {
    materials.push(mat);
    return mat;
  };

  const propCtx: PropBuilderContext = {
    registerGeo,
    registerMat,
    castShadow: !isSoftwareGl,
  };

  // Architectural PBR Materials
  const plinthMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0x160e26, roughness: 0.45, metalness: 0.25 })
  );
  const brassMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.22, metalness: 0.92 })
  );
  const stuccoMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.concreteDiffuse,
      bumpMap: textures.concreteBump,
      bumpScale: 0.022,
      color: 0xdccfb8,
      roughness: 0.84,
      metalness: 0.03,
    })
  );
  const interiorWallMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0xf2eee6, roughness: 0.72, metalness: 0.02 })
  );
  const crispWhiteMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0xf7f4ee, roughness: 0.56, metalness: 0.04 })
  );
  const ceramicWhiteMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.16, metalness: 0.08 })
  );
  const roofTileMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.terracottaDiffuse,
      bumpMap: textures.terracottaBump,
      bumpScale: 0.045,
      color: 0xb84638,
      roughness: 0.66,
      metalness: 0.05,
    })
  );
  const brickDriveMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.brickPaverDiffuse,
      roughness: 0.84,
      metalness: 0.03,
    })
  );
  const stoneWallMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.stoneDiffuse,
      bumpMap: textures.stoneBump,
      bumpScale: 0.035,
      color: 0x9b928b,
      roughness: 0.86,
      metalness: 0.04,
    })
  );
  const birchWoodMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.woodDiffuse,
      bumpMap: textures.woodBump,
      bumpScale: 0.015,
      color: 0xe4c297,
      roughness: 0.5,
      metalness: 0.04,
    })
  );
  const walnutWoodMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.woodDiffuse,
      bumpMap: textures.woodBump,
      bumpScale: 0.015,
      color: 0x6b4125,
      roughness: 0.44,
      metalness: 0.06,
    })
  );
  const barkMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.barkDiffuse,
      bumpMap: textures.barkBump,
      bumpScale: 0.038,
      color: 0x735c47,
      roughness: 0.94,
      metalness: 0.02,
    })
  );
  const marbleFloorMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.marbleDiffuse,
      roughness: 0.18,
      metalness: 0.08,
    })
  );
  const tileFloorMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.tileFloorDiffuse,
      roughness: 0.24,
      metalness: 0.06,
    })
  );
  const rugMat = registerMat(
    new THREE.MeshStandardMaterial({ map: textures.rugDiffuse, roughness: 0.94, metalness: 0.0 })
  );
  const darkCharcoalMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0x2f3036, roughness: 0.42, metalness: 0.18 })
  );
  const windowMullionMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0x222026, roughness: 0.34, metalness: 0.62 })
  );
  const steelMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0x767c85, roughness: 0.26, metalness: 0.85 })
  );
  const chromeMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0xdce0e8, roughness: 0.16, metalness: 0.94 })
  );
  const sageGreenMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0x4c6b58, roughness: 0.85, metalness: 0.02 })
  );
  const warmGlowMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xfff0c8,
      emissive: 0xffc670,
      emissiveIntensity: 1.05,
      roughness: 0.3,
    })
  );
  const terracottaPaintMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0xb93b27, roughness: 0.65, metalness: 0.04 })
  );
  const glassMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xaad4ff,
      roughness: 0.06,
      metalness: 0.3,
      transparent: true,
      opacity: 0.42,
    })
  );
  const architecturalGlassMat = registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x90b9e0,
      roughness: 0.05,
      metalness: 0.55,
      transparent: true,
      opacity: 0.6,
    })
  );
  const lawnMat = registerMat(
    new THREE.MeshStandardMaterial({
      map: textures.grassDiffuse,
      bumpMap: textures.grassBump,
      bumpScale: 0.024,
      color: 0x8db57a,
      roughness: 0.94,
      metalness: 0.01,
    })
  );
  const indoorPlantMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0x3b6e35, roughness: 0.8, metalness: 0.02 })
  );
  const flowerMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0xc92c5c, roughness: 0.6, metalness: 0.02 })
  );
  const carPaintMat = registerMat(
    new THREE.MeshPhysicalMaterial({
      color: 0xf4f6fa,
      roughness: 0.12,
      metalness: 0.42,
      clearcoat: 0.9,
      clearcoatRoughness: 0.08,
    })
  );
  const tireMat = registerMat(
    new THREE.MeshStandardMaterial({ color: 0x181a1e, roughness: 0.85, metalness: 0.05 })
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

  /**
   * Builds a recessed architectural window with stone sill, upper cornice lintel,
   * dark bronze perimeter frame, cross mullions, and reflective architectural glass.
   */
  const addDetailedWindow = (
    parent: THREE.Group,
    width: number,
    height: number,
    x: number,
    y: number,
    z: number,
    rotY = 0
  ) => {
    const winGroup = new THREE.Group();
    winGroup.position.set(x, y, z);
    winGroup.rotation.y = rotY;
    parent.add(winGroup);

    // Outer projecting stone sill + upper cornice lintel
    addBox(winGroup, width + 0.1, 0.045, 0.22, 0, -height / 2 - 0.02, 0.02, crispWhiteMat);
    addBox(winGroup, width + 0.12, 0.055, 0.22, 0, height / 2 + 0.025, 0.02, crispWhiteMat);

    // Dark bronze-aluminum outer casing frame
    addBox(winGroup, width, 0.035, 0.18, 0, height / 2 - 0.015, 0, windowMullionMat);
    addBox(winGroup, width, 0.035, 0.18, 0, -height / 2 + 0.015, 0, windowMullionMat);
    addBox(winGroup, 0.035, height, 0.18, -width / 2 + 0.015, 0, 0, windowMullionMat);
    addBox(winGroup, 0.035, height, 0.18, width / 2 - 0.015, 0, 0, windowMullionMat);

    // Center cross mullions
    addBox(winGroup, 0.022, height - 0.04, 0.15, 0, 0, 0, windowMullionMat);
    addBox(winGroup, width - 0.04, 0.022, 0.15, 0, 0.04, 0, windowMullionMat);

    // Reflective tinted glazing pane
    addBox(winGroup, width - 0.05, height - 0.05, 0.03, 0, 0, 0, architecturalGlassMat, false);
  };

  const rootGroup = new THREE.Group();
  rootGroup.position.set(0, -0.82, 0);
  scene.add(rootGroup);

  // =========================================================================
  // 1. REALISTIC ESTATE GROUNDS, TEXTURED LAWN, CURBING & CLEAR PERIMETER TREES
  // =========================================================================
  const shadowGeo = registerGeo(new THREE.PlaneGeometry(11.8, 9.6));
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
  contactShadow.position.y = -0.22;
  rootGroup.add(contactShadow);

  const plinthGeo = registerGeo(createRoundedSlabGeo(9.8, 7.2, 0.22, 0.22));
  const plinth = new THREE.Mesh(plinthGeo, plinthMat);
  plinth.position.y = -0.11;
  plinth.receiveShadow = !isSoftwareGl;
  rootGroup.add(plinth);

  const brassBandGeo = registerGeo(createRoundedSlabGeo(9.84, 7.24, 0.032, 0.22));
  const brassBand = new THREE.Mesh(brassBandGeo, brassMat);
  brassBand.position.y = -0.015;
  rootGroup.add(brassBand);

  // Textured Estate Lawn + Brick Paver Driveway + Stone Curbing + Front Walkway
  addBox(rootGroup, 9.36, 0.06, 6.76, 0, 0.03, 0, lawnMat);
  addBox(rootGroup, 1.48, 0.07, 2.55, -2.82, 0.04, 1.98, brickDriveMat);
  // Crisp stone driveway curbing
  addBox(rootGroup, 0.08, 0.09, 2.58, -3.56, 0.05, 1.98, crispWhiteMat);
  addBox(rootGroup, 0.08, 0.09, 2.58, -2.08, 0.05, 1.98, crispWhiteMat);

  addBox(rootGroup, 3.35, 0.07, 0.85, 0.28, 0.04, 2.25, brickDriveMat);
  addBox(rootGroup, 1.15, 0.07, 1.05, 0.08, 0.04, 1.5, brickDriveMat);

  // Exterior Pathway Bollard Lights along front walkway
  [
    [-0.65, 1.85],
    [0.82, 1.85],
    [-1.98, 2.65],
  ].forEach(([bx, bz]) => {
    addBox(rootGroup, 0.05, 0.24, 0.05, bx, 0.18, bz, darkCharcoalMat);
    addBox(rootGroup, 0.055, 0.06, 0.055, bx, 0.31, bz, warmGlowMat, false);
  });

  // Low Exterior Courtyard Shrubs & Ornamental Planters
  [
    [-1.45, 1.38],
    [-1.12, 1.42],
    [1.48, 1.4],
    [1.82, 1.36],
    [3.35, 2.85],
    [-4.12, 1.2],
  ].forEach(([fx, fz]) => {
    const bush = new THREE.Mesh(registerGeo(new THREE.DodecahedronGeometry(0.11, 1)), indoorPlantMat);
    bush.position.set(fx, 0.11, fz);
    bush.scale.set(1.3, 0.7, 1.2);
    rootGroup.add(bush);
    const bloom = new THREE.Mesh(registerGeo(new THREE.DodecahedronGeometry(0.055, 0)), flowerMat);
    bloom.position.set(fx + 0.04, 0.16, fz + 0.03);
    rootGroup.add(bloom);
  });

  // Realistic Palm & Botanical Branched Trees cleanly OUT on the Perimeter Lawn
  const rightPalm = createRealisticPalmTree(propCtx, barkMat, 1.1, textures.palmFrondAlpha);
  rightPalm.position.set(4.02, 0.05, 2.25);
  rootGroup.add(rightPalm);

  const frontLeftTree = createRealisticCourtyardTree(
    propCtx,
    barkMat,
    0.9,
    textures.leafClusterAlpha
  );
  frontLeftTree.position.set(-4.08, 0.05, 2.38);
  rootGroup.add(frontLeftTree);

  const rearLeftTree = createRealisticCourtyardTree(
    propCtx,
    barkMat,
    0.94,
    textures.leafClusterAlpha
  );
  rearLeftTree.position.set(-3.98, 0.05, -2.58);
  rootGroup.add(rearLeftTree);

  const rearRightTree = createRealisticCourtyardTree(
    propCtx,
    barkMat,
    0.88,
    textures.leafClusterAlpha
  );
  rearRightTree.position.set(4.08, 0.05, -2.54);
  rootGroup.add(rearRightTree);

  // Sculpted Realistic Luxury White Sports Sedan on Brick Driveway
  const carGroup = createRealisticLuxurySedan(propCtx, carPaintMat, chromeMat, glassMat, tireMat);
  carGroup.position.set(-2.82, 0.075, 2.24);
  carGroup.rotation.y = 0.03;
  rootGroup.add(carGroup);
  explodableParts.push({
    object: carGroup,
    basePosition: carGroup.position.clone(),
    explodeVector: new THREE.Vector3(-0.45, 0.04, 0.72),
  });

  // =========================================================================
  // 2. GROUND FLOOR 3D CUTAWAY ROOMS (KITCHEN, DINING, FOYER STAIRS & LIVING)
  // =========================================================================
  const groundRoomsGroup = new THREE.Group();
  rootGroup.add(groundRoomsGroup);

  // Ground Floor Slab: Garage Concrete + Main Mansion Marble Floor
  addBox(groundRoomsGroup, 1.25, 0.09, 1.75, -2.82, 0.09, 0.15, crispWhiteMat);
  addBox(groundRoomsGroup, 5.0, 0.09, 2.86, 0.25, 0.09, -0.45, marbleFloorMat);

  // Garage Storage Tool Cabinet inside Left Wing
  addBox(groundRoomsGroup, 0.34, 0.92, 1.12, -2.42, 0.59, -0.42, steelMat);

  // Perimeter Back & Left Interior Walls (kept in place as cutaway backdrop!)
  addBox(groundRoomsGroup, 5.0, 1.2, 0.1, 0.25, 0.73, -1.83, stuccoMat);
  addBox(groundRoomsGroup, 0.1, 1.2, 2.86, -2.2, 0.73, -0.45, stuccoMat);

  // --- GROUND INTERIOR PARTITION WALLS & DOORWAYS ---
  addBox(groundRoomsGroup, 1.25, 1.18, 0.07, -1.52, 0.72, -0.18, interiorWallMat);
  addBox(groundRoomsGroup, 0.45, 0.26, 0.07, -0.68, 1.18, -0.18, interiorWallMat);
  addBox(groundRoomsGroup, 0.08, 1.18, 1.32, 0.48, 0.72, -1.12, interiorWallMat);
  addBox(groundRoomsGroup, 0.08, 1.18, 0.72, 0.48, 0.72, 0.56, interiorWallMat);
  addBox(groundRoomsGroup, 0.08, 0.28, 0.88, 0.48, 1.17, -0.02, interiorWallMat);

  // --- ROOM 1 (BACK-LEFT): MODERN WALNUT & MARBLE KITCHEN ---
  addBox(groundRoomsGroup, 0.48, 1.04, 0.42, -1.86, 0.65, -1.54, steelMat);
  addBox(groundRoomsGroup, 0.02, 0.46, 0.03, -1.89, 0.68, -1.32, chromeMat);
  addBox(groundRoomsGroup, 0.02, 0.46, 0.03, -1.83, 0.68, -1.32, chromeMat);
  addBox(groundRoomsGroup, 0.4, 1.04, 0.42, -1.38, 0.65, -1.54, walnutWoodMat);
  addBox(groundRoomsGroup, 0.3, 0.18, 0.03, -1.38, 0.86, -1.32, darkCharcoalMat);
  addBox(groundRoomsGroup, 0.3, 0.24, 0.03, -1.38, 0.56, -1.32, darkCharcoalMat);
  addBox(groundRoomsGroup, 1.48, 0.44, 0.42, -0.4, 0.35, -1.54, walnutWoodMat);
  addBox(groundRoomsGroup, 1.5, 0.04, 0.44, -0.4, 0.59, -1.54, marbleFloorMat);
  addBox(groundRoomsGroup, 0.92, 0.36, 0.24, -0.68, 1.02, -1.64, darkCharcoalMat);
  addBox(groundRoomsGroup, 0.46, 0.36, 0.22, 0.06, 1.02, -1.64, glassMat, false);
  addBox(groundRoomsGroup, 0.95, 0.42, 0.38, -0.78, 0.34, -0.68, walnutWoodMat);
  addBox(groundRoomsGroup, 0.98, 0.04, 0.42, -0.78, 0.57, -0.68, marbleFloorMat);
  [-0.98, -0.58].forEach((sx) => {
    const stem = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.025, 0.035, 0.34, 10)), chromeMat);
    stem.position.set(sx, 0.3, -0.38);
    groundRoomsGroup.add(stem);
    const seat = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 14)), darkCharcoalMat);
    seat.position.set(sx, 0.47, -0.38);
    groundRoomsGroup.add(seat);
  });

  // --- ROOM 2 (FRONT-LEFT): DINING ROOM BAY ---
  addBox(groundRoomsGroup, 0.98, 0.04, 0.56, -1.48, 0.46, 0.38, walnutWoodMat);
  addBox(groundRoomsGroup, 0.06, 0.34, 0.06, -1.88, 0.29, 0.18, darkCharcoalMat);
  addBox(groundRoomsGroup, 0.06, 0.34, 0.06, -1.08, 0.29, 0.18, darkCharcoalMat);
  addBox(groundRoomsGroup, 0.06, 0.34, 0.06, -1.88, 0.29, 0.58, darkCharcoalMat);
  addBox(groundRoomsGroup, 0.06, 0.34, 0.06, -1.08, 0.29, 0.58, darkCharcoalMat);
  [
    [-1.72, 0.04],
    [-1.24, 0.04],
    [-1.72, 0.72],
    [-1.24, 0.72],
  ].forEach(([cx, cz]) => {
    addBox(groundRoomsGroup, 0.22, 0.24, 0.22, cx, 0.25, cz, sageGreenMat);
  });
  const centerpiece = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.09, 0.05, 0.05, 14)), brassMat);
  centerpiece.position.set(-1.48, 0.5, 0.38);
  groundRoomsGroup.add(centerpiece);

  // --- ROOM 3 (CENTER): GRAND FOYER & 3D FLOATING STAIRCASE UP TO 2ND FLOOR ---
  for (let s = 0; s < 10; s++) {
    const treadY = 0.2 + s * 0.115;
    const treadZ = 0.62 - s * 0.145;
    addBox(groundRoomsGroup, 0.52, 0.045, 0.14, 0.08, treadY, treadZ, birchWoodMat);
  }
  const stairGlass = new THREE.Mesh(registerGeo(new THREE.BoxGeometry(0.025, 0.34, 1.48)), glassMat);
  stairGlass.position.set(-0.18, 0.88, -0.05);
  stairGlass.rotation.x = 0.65;
  groundRoomsGroup.add(stairGlass);

  // --- ROOM 4 (RIGHT WING): CONTEMPORARY LIVING ROOM LOUNGE ---
  addBox(groundRoomsGroup, 0.06, 0.68, 1.22, 0.55, 0.76, -0.46, crispWhiteMat);
  addBox(groundRoomsGroup, 0.03, 0.38, 0.72, 0.59, 0.76, -0.46, darkCharcoalMat);
  addBox(groundRoomsGroup, 0.24, 0.16, 1.48, 0.66, 0.23, -0.46, walnutWoodMat);
  addBox(groundRoomsGroup, 0.26, 0.03, 1.5, 0.66, 0.32, -0.46, marbleFloorMat);
  addBox(groundRoomsGroup, 1.38, 1.06, 0.04, 1.62, 0.71, -1.75, glassMat, false);
  addBox(groundRoomsGroup, 0.28, 1.04, 0.07, 1.06, 0.7, -1.7, crispWhiteMat);
  addBox(groundRoomsGroup, 0.28, 1.04, 0.07, 2.18, 0.7, -1.7, crispWhiteMat);
  addBox(groundRoomsGroup, 1.56, 0.02, 1.52, 1.72, 0.14, -0.35, rugMat);
  addBox(groundRoomsGroup, 1.22, 0.2, 0.46, 1.82, 0.24, -1.04, darkCharcoalMat);
  addBox(groundRoomsGroup, 1.22, 0.34, 0.12, 1.82, 0.38, -1.24, darkCharcoalMat);
  addBox(groundRoomsGroup, 0.46, 0.2, 1.04, 2.22, 0.24, -0.36, darkCharcoalMat);
  addBox(groundRoomsGroup, 0.12, 0.34, 1.04, 2.42, 0.38, -0.36, darkCharcoalMat);
  addBox(groundRoomsGroup, 0.18, 0.16, 0.1, 1.52, 0.42, -1.14, sageGreenMat);
  addBox(groundRoomsGroup, 0.18, 0.16, 0.1, 2.08, 0.42, -1.14, terracottaPaintMat);
  [
    [1.62, -0.38, 0.2, 0.16],
    [1.46, -0.18, 0.16, 0.13],
    [1.82, -0.22, 0.14, 0.19],
  ].forEach(([tx, tz, rad, th]) => {
    const tbl = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(rad, rad, 0.025, 20)), brassMat);
    tbl.position.set(tx, 0.16 + th, tz);
    groundRoomsGroup.add(tbl);
  });
  const lampPole = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.018, 0.022, 0.85, 8)), brassMat);
  lampPole.position.set(2.45, 0.56, -1.48);
  groundRoomsGroup.add(lampPole);
  const lampShade = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.08, 0.12, 0.14, 14)), warmGlowMat);
  lampShade.position.set(2.45, 1.02, -1.48);
  groundRoomsGroup.add(lampShade);
  const livingPot = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.11, 0.08, 0.2, 12)), ceramicWhiteMat);
  livingPot.position.set(2.42, 0.23, 0.58);
  groundRoomsGroup.add(livingPot);
  const livingPlant = new THREE.Mesh(registerGeo(new THREE.DodecahedronGeometry(0.17, 1)), indoorPlantMat);
  livingPlant.position.set(2.42, 0.48, 0.58);
  groundRoomsGroup.add(livingPlant);
  [0.32, 0.24, 0.16].forEach((r, idx) => {
    const ring = new THREE.Mesh(registerGeo(new THREE.TorusGeometry(r, 0.015, 10, 36)), chromeMat);
    ring.position.set(1.72, 1.2 - idx * 0.055, -0.35);
    ring.rotation.set(Math.PI / 2 + (idx - 1) * 0.15, idx * 0.2, 0);
    groundRoomsGroup.add(ring);
  });

  explodableParts.push({
    object: groundRoomsGroup,
    basePosition: groundRoomsGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 0.05, 0),
  });

  // =========================================================================
  // 3. ARCHITECTURAL GROUND FACADE, STONE PLINTH, ARCHED PORTICO & GARAGE
  // =========================================================================
  const frontFacadeGroup = new THREE.Group();
  rootGroup.add(frontFacadeGroup);

  // Main Front Two-Tone Stucco Wall + Stacked-Stone Lower Foundation Course
  addBox(frontFacadeGroup, 5.04, 1.22, 0.14, 0.25, 0.73, 0.96, stuccoMat);
  addBox(frontFacadeGroup, 5.08, 0.26, 0.18, 0.25, 0.24, 0.96, stoneWallMat);
  // Right Stacked-Stone Accent Exterior Wall + White Corner Quoins
  addBox(frontFacadeGroup, 0.14, 1.22, 2.88, 2.75, 0.73, -0.45, stoneWallMat);
  addBox(frontFacadeGroup, 0.18, 1.24, 0.2, -2.2, 0.73, 0.96, crispWhiteMat);
  addBox(frontFacadeGroup, 0.18, 1.24, 0.2, 2.75, 0.73, 0.96, crispWhiteMat);
  addBox(frontFacadeGroup, 0.18, 1.24, 0.2, 0.48, 0.73, 0.96, crispWhiteMat);
  // Horizontal Limestone String-Course Belt Molding between floors
  addBox(frontFacadeGroup, 5.14, 0.08, 0.22, 0.25, 1.33, 0.96, crispWhiteMat);
  addBox(frontFacadeGroup, 0.22, 0.08, 2.94, 2.75, 1.33, -0.45, crispWhiteMat);

  // Recessed Multi-Pane Architectural Windows (Front & Right Wall)
  [-1.48, 1.28, 2.18].forEach((wx) => {
    addDetailedWindow(frontFacadeGroup, 0.6, 0.72, wx, 0.76, 0.96, 0);
  });
  [-1.12, 0.18].forEach((wz) => {
    addDetailedWindow(frontFacadeGroup, 0.62, 0.74, 2.75, 0.76, wz, Math.PI / 2);
  });

  // Recessed Walnut Double Entry Door + Brass Pulls + Transom + Porch Sconces
  addBox(frontFacadeGroup, 0.62, 1.0, 0.18, 0.08, 0.62, 0.95, crispWhiteMat);
  addBox(frontFacadeGroup, 0.52, 0.92, 0.16, 0.08, 0.58, 0.96, walnutWoodMat);
  addBox(frontFacadeGroup, 0.02, 0.34, 0.03, 0.04, 0.58, 1.06, brassMat);
  addBox(frontFacadeGroup, 0.02, 0.34, 0.03, 0.12, 0.58, 1.06, brassMat);
  [-0.28, 0.44].forEach((sx) => {
    addBox(frontFacadeGroup, 0.06, 0.14, 0.06, sx, 0.88, 1.06, warmGlowMat, false);
  });

  // Multi-Step Limestone Porch Entry Steps
  addBox(frontFacadeGroup, 1.48, 0.055, 0.86, 0.08, 0.08, 1.36, crispWhiteMat);
  addBox(frontFacadeGroup, 1.32, 0.055, 0.7, 0.08, 0.13, 1.28, crispWhiteMat);

  // Arched Front Entry Portico with True Semicircular Masonry Arch & Stone Columns
  const porticoArch = new THREE.Mesh(
    registerGeo(createArchedFacadeGeo(1.42, 1.22, 0.16, 0.46, 0.72)),
    stuccoMat
  );
  porticoArch.position.set(0.08, 0.14, 1.68);
  porticoArch.castShadow = !isSoftwareGl;
  porticoArch.receiveShadow = !isSoftwareGl;
  frontFacadeGroup.add(porticoArch);
  // Portico Side Columns, Plinths & Terracotta Hip Roof
  [-0.56, 0.72].forEach((px) => {
    addBox(frontFacadeGroup, 0.22, 0.24, 0.22, px, 0.24, 1.68, stoneWallMat);
    addBox(frontFacadeGroup, 0.2, 0.06, 0.2, px, 1.32, 1.68, crispWhiteMat);
  });
  addBox(frontFacadeGroup, 1.54, 0.1, 0.94, 0.08, 1.38, 1.38, crispWhiteMat);
  const porticoRoof = new THREE.Mesh(
    registerGeo(createGableRoofGeo(1.62, 1.04, 0.42)),
    roofTileMat
  );
  porticoRoof.position.set(0.08, 1.43, 1.38);
  porticoRoof.castShadow = !isSoftwareGl;
  frontFacadeGroup.add(porticoRoof);

  // Left Porte-Cochere Garage Wing with True Curved Masonry Arch & Ridge Cap
  addBox(frontFacadeGroup, 0.18, 1.28, 1.85, -3.44, 0.74, 0.15, stuccoMat);
  addBox(frontFacadeGroup, 0.22, 0.28, 1.88, -3.44, 0.24, 0.15, stoneWallMat);
  const garageArch = new THREE.Mesh(
    registerGeo(createArchedFacadeGeo(1.32, 1.26, 0.18, 0.46, 0.76)),
    stuccoMat
  );
  garageArch.position.set(-2.82, 0.12, 1.02);
  garageArch.castShadow = !isSoftwareGl;
  frontFacadeGroup.add(garageArch);
  addBox(frontFacadeGroup, 1.48, 0.08, 2.02, -2.82, 1.38, 0.15, crispWhiteMat);
  const garageRoof = new THREE.Mesh(
    registerGeo(createGableRoofGeo(1.52, 2.04, 0.5)),
    roofTileMat
  );
  garageRoof.position.set(-2.82, 1.42, 0.15);
  garageRoof.castShadow = !isSoftwareGl;
  frontFacadeGroup.add(garageRoof);

  explodableParts.push({
    object: frontFacadeGroup,
    basePosition: frontFacadeGroup.position.clone(),
    explodeVector: new THREE.Vector3(0.65, 0.08, 1.85),
  });

  // =========================================================================
  // 4. SECOND STORY 3D INTERIOR ROOMS (lifts mid-air cleanly with open rooms!)
  // =========================================================================
  const upperRoomsGroup = new THREE.Group();
  rootGroup.add(upperRoomsGroup);

  addBox(upperRoomsGroup, 2.02, 0.1, 2.86, -1.24, 1.34, -0.45, walnutWoodMat);
  addBox(upperRoomsGroup, 0.72, 0.1, 0.92, 0.12, 1.34, -1.42, walnutWoodMat);
  addBox(upperRoomsGroup, 2.34, 0.1, 2.86, 1.58, 1.34, -0.45, walnutWoodMat);
  addBox(upperRoomsGroup, 0.03, 0.34, 1.82, 0.44, 1.56, 0.04, glassMat, false);
  addBox(upperRoomsGroup, 0.68, 0.34, 0.03, 0.1, 1.56, -0.88, glassMat, false);

  addBox(upperRoomsGroup, 5.0, 1.18, 0.1, 0.25, 1.98, -1.83, stuccoMat);
  addBox(upperRoomsGroup, 0.1, 1.18, 2.86, -2.2, 1.98, -0.45, stuccoMat);

  addBox(upperRoomsGroup, 1.25, 1.16, 0.07, -1.52, 1.97, -0.22, interiorWallMat);
  addBox(upperRoomsGroup, 0.45, 0.26, 0.07, -0.68, 2.42, -0.22, interiorWallMat);
  addBox(upperRoomsGroup, 0.07, 1.16, 1.35, -0.28, 1.97, -1.12, interiorWallMat);
  addBox(upperRoomsGroup, 0.07, 1.16, 0.72, -0.28, 1.97, 0.56, interiorWallMat);
  addBox(upperRoomsGroup, 0.07, 1.16, 1.32, 0.48, 1.97, -1.14, interiorWallMat);
  addBox(upperRoomsGroup, 0.07, 1.16, 0.65, 0.48, 1.97, 0.6, interiorWallMat);

  // Master Bedroom Suite
  addBox(upperRoomsGroup, 1.92, 0.72, 0.08, 1.62, 1.76, -1.72, darkCharcoalMat);
  [1.14, 1.62, 2.1].forEach((px, idx) => {
    addBox(upperRoomsGroup, 0.3, 0.3, 0.03, px, 2.26, -1.74, darkCharcoalMat);
    addBox(
      upperRoomsGroup,
      0.22,
      0.22,
      0.04,
      px,
      2.26,
      -1.73,
      idx === 1 ? terracottaPaintMat : brassMat,
      false
    );
  });
  addBox(upperRoomsGroup, 1.18, 0.22, 1.38, 1.62, 1.5, -1.0, birchWoodMat);
  addBox(upperRoomsGroup, 1.18, 0.54, 0.07, 1.62, 1.72, -1.65, birchWoodMat);
  addBox(upperRoomsGroup, 1.06, 0.14, 1.26, 1.62, 1.65, -1.0, darkCharcoalMat);
  addBox(upperRoomsGroup, 1.08, 0.06, 0.88, 1.62, 1.73, -0.78, sageGreenMat);
  addBox(upperRoomsGroup, 0.42, 0.09, 0.24, 1.36, 1.75, -1.45, sageGreenMat);
  addBox(upperRoomsGroup, 0.42, 0.09, 0.24, 1.88, 1.75, -1.45, sageGreenMat);
  [0.86, 2.38].forEach((nx) => {
    addBox(upperRoomsGroup, 0.28, 0.28, 0.28, nx, 1.53, -1.52, birchWoodMat);
    const shade = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.075, 0.105, 0.14, 16)), warmGlowMat);
    shade.position.set(nx, 1.8, -1.52);
    upperRoomsGroup.add(shade);
  });
  addBox(upperRoomsGroup, 1.04, 0.2, 0.32, 1.62, 1.49, 0.02, birchWoodMat);
  addBox(upperRoomsGroup, 0.48, 0.22, 0.48, 2.34, 1.5, 0.48, darkCharcoalMat);
  addBox(upperRoomsGroup, 0.48, 0.34, 0.1, 2.34, 1.71, 0.68, darkCharcoalMat);
  addBox(upperRoomsGroup, 0.88, 0.92, 0.34, 1.12, 1.85, 0.72, birchWoodMat);
  addBox(upperRoomsGroup, 0.8, 0.82, 0.03, 1.12, 1.85, 0.54, glassMat, false);

  // Study / Guest Bedroom
  addBox(upperRoomsGroup, 1.15, 0.24, 0.64, -1.52, 1.51, -1.44, birchWoodMat);
  addBox(upperRoomsGroup, 1.08, 0.1, 0.58, -1.52, 1.65, -1.44, sageGreenMat);
  addBox(upperRoomsGroup, 0.44, 0.44, 0.96, -1.86, 1.61, -0.78, walnutWoodMat);
  addBox(upperRoomsGroup, 0.04, 0.24, 0.42, -1.94, 1.98, -0.78, darkCharcoalMat);
  addBox(upperRoomsGroup, 0.02, 0.2, 0.38, -1.91, 1.98, -0.78, warmGlowMat, false);
  addBox(upperRoomsGroup, 0.26, 0.28, 0.26, -1.42, 1.53, -0.78, darkCharcoalMat);

  // En-Suite Master Bathroom
  addBox(upperRoomsGroup, 1.84, 0.02, 1.04, -1.24, 1.4, 0.38, tileFloorMat);
  addBox(upperRoomsGroup, 0.58, 0.06, 0.58, -1.84, 1.44, 0.16, ceramicWhiteMat);
  addBox(upperRoomsGroup, 0.58, 0.88, 0.03, -1.84, 1.88, 0.45, glassMat, false);
  addBox(upperRoomsGroup, 0.03, 0.88, 0.58, -1.55, 1.88, 0.16, glassMat, false);
  addBox(upperRoomsGroup, 0.32, 0.26, 0.68, -1.96, 1.64, 0.62, walnutWoodMat);
  const sinkVessel = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.11, 0.08, 0.08, 16)), ceramicWhiteMat);
  sinkVessel.position.set(-1.95, 1.81, 0.62);
  upperRoomsGroup.add(sinkVessel);
  const vanityMirror = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.18, 0.18, 0.03, 20)), warmGlowMat);
  vanityMirror.rotation.z = Math.PI / 2;
  vanityMirror.position.set(-2.12, 2.12, 0.62);
  upperRoomsGroup.add(vanityMirror);
  const soakingTub = new THREE.Mesh(registerGeo(new THREE.CylinderGeometry(0.24, 0.2, 0.3, 20)), ceramicWhiteMat);
  soakingTub.scale.set(1.5, 1, 0.88);
  soakingTub.position.set(-0.92, 1.55, 0.44);
  upperRoomsGroup.add(soakingTub);

  explodableParts.push({
    object: upperRoomsGroup,
    basePosition: upperRoomsGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 1.5, 0),
  });

  // =========================================================================
  // 5. SECOND STORY ARCHITECTURAL ENVELOPE + GLASS BALCONY TERRACE
  // =========================================================================
  const upperEnvelopeGroup = new THREE.Group();
  rootGroup.add(upperEnvelopeGroup);

  addBox(upperEnvelopeGroup, 5.04, 1.18, 0.12, 0.25, 1.98, 0.96, stuccoMat);
  addBox(upperEnvelopeGroup, 0.12, 1.18, 2.86, 2.75, 1.98, -0.45, stuccoMat);
  addBox(upperEnvelopeGroup, 0.18, 1.2, 0.2, -2.2, 1.98, 0.96, crispWhiteMat);
  addBox(upperEnvelopeGroup, 0.18, 1.2, 0.2, 2.75, 1.98, 0.96, crispWhiteMat);
  addBox(upperEnvelopeGroup, 0.18, 1.2, 0.2, 0.48, 1.98, 0.96, crispWhiteMat);

  // Recessed Multi-Pane Upper Architectural Windows
  [-1.48, -0.82, 1.28, 2.18].forEach((wx) => {
    addDetailedWindow(upperEnvelopeGroup, 0.46, 0.7, wx, 2.0, 0.96, 0);
  });
  [-1.12, 0.18].forEach((wz) => {
    addDetailedWindow(upperEnvelopeGroup, 0.56, 0.7, 2.75, 2.0, wz, Math.PI / 2);
  });

  // Cantilevered Upper Front Balcony Terrace with Frameless Glass & Brass Railings
  addBox(upperEnvelopeGroup, 1.88, 0.08, 0.62, 0.08, 1.38, 1.32, crispWhiteMat);
  addBox(upperEnvelopeGroup, 1.84, 0.38, 0.025, 0.08, 1.61, 1.61, glassMat, false);
  addBox(upperEnvelopeGroup, 0.025, 0.38, 0.6, -0.84, 1.61, 1.32, glassMat, false);
  addBox(upperEnvelopeGroup, 0.025, 0.38, 0.6, 1.0, 1.61, 1.32, glassMat, false);
  // Brushed Brass Top Handrail & Balcony Sliding Glass French Door
  addBox(upperEnvelopeGroup, 1.88, 0.03, 0.04, 0.08, 1.81, 1.61, brassMat);
  addBox(upperEnvelopeGroup, 0.04, 0.03, 0.6, -0.84, 1.81, 1.32, brassMat);
  addBox(upperEnvelopeGroup, 0.04, 0.03, 0.6, 1.0, 1.81, 1.32, brassMat);
  addDetailedWindow(upperEnvelopeGroup, 0.92, 0.96, 0.08, 1.92, 0.96, 0);

  explodableParts.push({
    object: upperEnvelopeGroup,
    basePosition: upperEnvelopeGroup.position.clone(),
    explodeVector: new THREE.Vector3(0.65, 1.58, 1.85),
  });

  // =========================================================================
  // 6. DETAILED SPANISH CLAY-TILE ROOF, RIDGE CAPS, CHIMNEY & CEILING FAN
  // =========================================================================
  const roofGroup = new THREE.Group();
  rootGroup.add(roofGroup);

  // Layered Eave Soffit + Crisp White Crown Cornice Molding
  addBox(roofGroup, 5.28, 0.07, 3.16, 0.25, 2.58, -0.45, walnutWoodMat);
  addBox(roofGroup, 5.42, 0.1, 3.3, 0.25, 2.63, -0.45, crispWhiteMat);

  const mainGableRoof = new THREE.Mesh(
    registerGeo(createGableRoofGeo(5.36, 3.22, 1.08)),
    roofTileMat
  );
  mainGableRoof.position.set(0.25, 2.68, -0.45);
  mainGableRoof.castShadow = !isSoftwareGl;
  mainGableRoof.receiveShadow = !isSoftwareGl;
  roofGroup.add(mainGableRoof);

  // Raised Clay Ridge Cap along Main Gable Peak
  const mainRidgeGeo = registerGeo(new THREE.CylinderGeometry(0.065, 0.065, 3.26, 10));
  mainRidgeGeo.rotateX(Math.PI / 2);
  const mainRidge = new THREE.Mesh(mainRidgeGeo, roofTileMat);
  mainRidge.position.set(0.25, 3.76, -0.45);
  roofGroup.add(mainRidge);

  // Transverse Cross-Gable Wing over Right Master Wing + Ridge Cap
  const wingRoof = new THREE.Mesh(
    registerGeo(createGableRoofGeo(2.5, 3.4, 0.95)),
    roofTileMat
  );
  wingRoof.rotation.y = Math.PI / 2;
  wingRoof.position.set(1.5, 2.68, -0.45);
  wingRoof.castShadow = !isSoftwareGl;
  roofGroup.add(wingRoof);

  const wingRidgeGeo = registerGeo(new THREE.CylinderGeometry(0.065, 0.065, 3.44, 10));
  wingRidgeGeo.rotateZ(Math.PI / 2);
  const wingRidge = new THREE.Mesh(wingRidgeGeo, roofTileMat);
  wingRidge.position.set(1.5, 3.63, -0.45);
  roofGroup.add(wingRidge);

  // Stucco Architectural Chimney Stack with Stone Cap
  addBox(roofGroup, 0.36, 0.92, 0.36, -1.25, 3.42, -1.15, stuccoMat);
  addBox(roofGroup, 0.44, 0.08, 0.44, -1.25, 3.9, -1.15, crispWhiteMat);

  // 5-Blade Chrome Ceiling Fan above Master Bedroom
  const fanHub = new THREE.Mesh(
    registerGeo(new THREE.CylinderGeometry(0.1, 0.1, 0.08, 16)),
    chromeMat
  );
  fanHub.position.set(1.62, 2.5, -0.65);
  roofGroup.add(fanHub);
  for (let b = 0; b < 5; b++) {
    const blade = new THREE.Mesh(
      registerGeo(new THREE.BoxGeometry(0.44, 0.015, 0.1)),
      darkCharcoalMat
    );
    const angle = (b / 5) * Math.PI * 2;
    blade.position.set(1.62 + Math.cos(angle) * 0.25, 2.49, -0.65 + Math.sin(angle) * 0.25);
    blade.rotation.y = -angle;
    roofGroup.add(blade);
  }

  explodableParts.push({
    object: roofGroup,
    basePosition: roofGroup.position.clone(),
    explodeVector: new THREE.Vector3(0, 3.05, 0),
  });

  // Controls State
  let targetExplode = 0;
  let currentExplode = 0;
  let resetPending = false;
  const pointerTarget = new THREE.Vector2(0, 0);
  const pointerSmooth = new THREE.Vector2(0, 0);
  const _tempVec = new THREE.Vector3();

  const onPointerMove = (e: PointerEvent) => {
    const rect = renderer.domElement.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    pointerTarget.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointerTarget.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
  };
  renderer.domElement.addEventListener('pointermove', onPointerMove, { passive: true });

  const applyFinish = (finish: SculptureFinish) => {
    if (finish === 'natural') {
      stuccoMat.map = textures.concreteDiffuse;
      stuccoMat.color.setHex(0xdccfb8);
      interiorWallMat.color.setHex(0xf2eee6);
      roofTileMat.map = textures.terracottaDiffuse;
      roofTileMat.color.setHex(0xb84638);
      crispWhiteMat.color.setHex(0xf7f4ee);
      birchWoodMat.map = textures.woodDiffuse;
      birchWoodMat.color.setHex(0xe4c297);
      groundInteriorLight.intensity = 2.8;
      upperInteriorLight.intensity = 2.5;
    } else if (finish === 'obsidian') {
      stuccoMat.map = textures.concreteDiffuse;
      stuccoMat.color.setHex(0x281b3f);
      interiorWallMat.color.setHex(0x3a285c);
      roofTileMat.map = textures.terracottaDiffuse;
      roofTileMat.color.setHex(0x4a256e);
      crispWhiteMat.color.setHex(0xd4af37);
      birchWoodMat.map = null;
      birchWoodMat.color.setHex(0xd4af37);
      groundInteriorLight.intensity = 3.4;
      upperInteriorLight.intensity = 3.1;
    } else {
      stuccoMat.map = null;
      stuccoMat.color.setHex(0xebe7de);
      interiorWallMat.color.setHex(0xf3efe8);
      roofTileMat.map = null;
      roofTileMat.color.setHex(0xd8d3ca);
      crispWhiteMat.color.setHex(0xf6f3ec);
      birchWoodMat.map = null;
      birchWoodMat.color.setHex(0xd3ccc0);
      groundInteriorLight.intensity = 1.1;
      upperInteriorLight.intensity = 0.9;
    }
    stuccoMat.needsUpdate = true;
    roofTileMat.needsUpdate = true;
    birchWoodMat.needsUpdate = true;
  };

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
      pointerSmooth.x = THREE.MathUtils.damp(pointerSmooth.x, pointerTarget.x, 4, dt);
      pointerSmooth.y = THREE.MathUtils.damp(pointerSmooth.y, pointerTarget.y, 4, dt);
      rootGroup.rotation.y = pointerSmooth.x * 0.07;

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
    setFinish: (finish) => {
      applyFinish(finish);
    },
    setWireframe: (enabled) => {
      stuccoMat.wireframe = enabled;
      interiorWallMat.wireframe = enabled;
      crispWhiteMat.wireframe = enabled;
      roofTileMat.wireframe = enabled;
      stoneWallMat.wireframe = enabled;
      birchWoodMat.wireframe = enabled;
      walnutWoodMat.wireframe = enabled;
      darkCharcoalMat.wireframe = enabled;
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
      renderer.domElement.removeEventListener('pointermove', onPointerMove);
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
