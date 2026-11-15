import * as THREE from 'three';

export interface PropBuilderContext {
  registerGeo: <T extends THREE.BufferGeometry>(geo: T) => T;
  registerMat: <T extends THREE.Material>(mat: T) => T;
  castShadow: boolean;
}

/**
 * Generates an organic multi-branched courtyard tree with flared buttress roots,
 * gnarled tapered primary + secondary branches, and hundreds of instanced
 * alpha-cutout botanical leaf-spray cards in natural sunlit/shaded greens.
 */
export function createRealisticCourtyardTree(
  ctx: PropBuilderContext,
  barkMat: THREE.Material,
  heightScale = 1.0,
  leafTexture?: THREE.Texture
): THREE.Group {
  const tree = new THREE.Group();

  // 1. Flared root collar & 4 surface buttress roots
  const rootGeo = ctx.registerGeo(
    new THREE.CylinderGeometry(0.068 * heightScale, 0.145 * heightScale, 0.28 * heightScale, 12)
  );
  const rootMesh = new THREE.Mesh(rootGeo, barkMat);
  rootMesh.position.y = 0.14 * heightScale;
  rootMesh.castShadow = ctx.castShadow;
  rootMesh.receiveShadow = ctx.castShadow;
  tree.add(rootMesh);

  for (let r = 0; r < 4; r++) {
    const rAngle = (r / 4) * Math.PI * 2 + 0.35;
    const buttressCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.18 * heightScale, 0),
      new THREE.Vector3(Math.cos(rAngle) * 0.12 * heightScale, 0.07 * heightScale, Math.sin(rAngle) * 0.12 * heightScale),
      new THREE.Vector3(Math.cos(rAngle) * 0.24 * heightScale, 0.015 * heightScale, Math.sin(rAngle) * 0.24 * heightScale),
    ]);
    const bGeo = ctx.registerGeo(
      new THREE.TubeGeometry(buttressCurve, 6, 0.032 * heightScale, 6, false)
    );
    const bMesh = new THREE.Mesh(bGeo, barkMat);
    bMesh.castShadow = ctx.castShadow;
    tree.add(bMesh);
  }

  // 2. Curved tapered main trunk built from tapered segments
  const trunkPoints = [
    new THREE.Vector3(0, 0.12 * heightScale, 0),
    new THREE.Vector3(0.025 * heightScale, 0.42 * heightScale, 0.018 * heightScale),
    new THREE.Vector3(-0.02 * heightScale, 0.72 * heightScale, -0.02 * heightScale),
    new THREE.Vector3(0.012 * heightScale, 1.02 * heightScale, 0.01 * heightScale),
  ];
  const trunkCurve = new THREE.CatmullRomCurve3(trunkPoints);
  const trunkSegs = 6;
  for (let s = 0; s < trunkSegs; s++) {
    const t0 = s / trunkSegs;
    const t1 = (s + 1) / trunkSegs;
    const p0 = trunkCurve.getPoint(t0);
    const p1 = trunkCurve.getPoint(t1);
    const rBottom = (0.074 - t0 * 0.032) * heightScale;
    const rTop = (0.074 - t1 * 0.032) * heightScale;
    const segLen = p0.distanceTo(p1) * 1.08;
    const segGeo = ctx.registerGeo(new THREE.CylinderGeometry(rTop, rBottom, segLen, 10));
    const segMesh = new THREE.Mesh(segGeo, barkMat);
    segMesh.position.copy(p0).lerp(p1, 0.5);
    segMesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      p1.clone().sub(p0).normalize()
    );
    segMesh.castShadow = ctx.castShadow;
    segMesh.receiveShadow = ctx.castShadow;
    tree.add(segMesh);
  }

  // 3. 6 primary structural limbs + 18 secondary twigs & collect foliage anchor tips
  const branchSpecs = [
    { dir: new THREE.Vector3(0.46, 0.52, 0.24), startY: 0.68 },
    { dir: new THREE.Vector3(-0.48, 0.55, 0.2), startY: 0.73 },
    { dir: new THREE.Vector3(0.18, 0.58, -0.48), startY: 0.77 },
    { dir: new THREE.Vector3(-0.35, 0.5, -0.38), startY: 0.8 },
    { dir: new THREE.Vector3(0.28, 0.62, 0.42), startY: 0.85 },
    { dir: new THREE.Vector3(-0.08, 0.7, -0.05), startY: 0.96 },
  ];

  const canopyCenters: THREE.Vector3[] = [];

  branchSpecs.forEach((b, bIdx) => {
    const start = new THREE.Vector3(0, b.startY * heightScale, 0);
    const mid = start.clone().addScaledVector(b.dir, 0.42 * heightScale);
    mid.y += 0.1 * heightScale;
    const end = start.clone().addScaledVector(b.dir, 0.78 * heightScale);

    const bCurve = new THREE.CatmullRomCurve3([start, mid, end]);
    const bGeo = ctx.registerGeo(
      new THREE.TubeGeometry(bCurve, 6, 0.025 * heightScale, 6, false)
    );
    const bMesh = new THREE.Mesh(bGeo, barkMat);
    bMesh.castShadow = ctx.castShadow;
    tree.add(bMesh);
    canopyCenters.push(end.clone());

    // 3 secondary sub-twigs branching off each limb
    for (let tw = 0; tw < 3; tw++) {
      const twAngle = (tw / 3) * Math.PI * 2 + bIdx * 0.9;
      const twStart = bCurve.getPoint(0.55 + tw * 0.2);
      const twEnd = twStart
        .clone()
        .add(
          new THREE.Vector3(
            Math.cos(twAngle) * 0.28 * heightScale,
            (0.16 + (tw % 2) * 0.08) * heightScale,
            Math.sin(twAngle) * 0.28 * heightScale
          )
        );
      const twigCurve = new THREE.CatmullRomCurve3([
        twStart,
        twStart.clone().lerp(twEnd, 0.5).add(new THREE.Vector3(0, 0.05 * heightScale, 0)),
        twEnd,
      ]);
      const twigGeo = ctx.registerGeo(
        new THREE.TubeGeometry(twigCurve, 4, 0.012 * heightScale, 5, false)
      );
      const twigMesh = new THREE.Mesh(twigGeo, barkMat);
      twigMesh.castShadow = ctx.castShadow;
      tree.add(twigMesh);
      canopyCenters.push(twEnd);
    }
  });

  // 4. Instanced alpha-cutout botanical leaf-spray cards (1 draw call, organic foliage!)
  const cardsPerAnchor = 10;
  const totalCards = canopyCenters.length * cardsPerAnchor;
  const cardSize = (leafTexture ? 0.36 : 0.22) * heightScale;
  const cardGeo = ctx.registerGeo(new THREE.PlaneGeometry(cardSize, cardSize));

  const leafMat = ctx.registerMat(
    leafTexture
      ? new THREE.MeshStandardMaterial({
          map: leafTexture,
          alphaTest: 0.42,
          side: THREE.DoubleSide,
          roughness: 0.78,
          metalness: 0.02,
        })
      : new THREE.MeshStandardMaterial({
          color: 0x45793a,
          side: THREE.DoubleSide,
          roughness: 0.8,
          metalness: 0.02,
        })
  );

  const instancedLeaves = new THREE.InstancedMesh(cardGeo, leafMat, totalCards);
  instancedLeaves.castShadow = ctx.castShadow;
  instancedLeaves.receiveShadow = ctx.castShadow;

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const leafPalette = [0x9ec488, 0x87b370, 0x739e5d, 0x5c8549, 0xa8ce8f];

  let idx = 0;
  canopyCenters.forEach((anchor, aIdx) => {
    for (let k = 0; k < cardsPerAnchor; k++) {
      const phi = ((k * 137.5 + aIdx * 43) % 360) * (Math.PI / 180);
      const rad = (0.06 + ((k * 29 + aIdx * 7) % 10) * 0.022) * heightScale;
      const yOff = (((k % 5) - 2) * 0.055 + 0.03) * heightScale;

      dummy.position.set(
        anchor.x + Math.cos(phi) * rad,
        anchor.y + yOff,
        anchor.z + Math.sin(phi) * rad
      );
      dummy.rotation.set(
        ((k % 4) - 1.5) * 0.55,
        phi + k * 0.7,
        (((k + aIdx) % 3) - 1) * 0.48
      );
      const s = 0.78 + ((k + aIdx) % 4) * 0.14;
      dummy.scale.set(s, s, s);
      dummy.updateMatrix();
      instancedLeaves.setMatrixAt(idx, dummy.matrix);

      // Sunlit upper leaves slightly brighter than lower interior shade
      const shadeIdx = yOff > 0 ? (k + aIdx) % 2 : 2 + ((k + aIdx) % 3);
      color.setHex(leafPalette[shadeIdx % leafPalette.length]);
      instancedLeaves.setColorAt(idx, color);
      idx++;
    }
  });
  instancedLeaves.instanceMatrix.needsUpdate = true;
  if (instancedLeaves.instanceColor) instancedLeaves.instanceColor.needsUpdate = true;
  tree.add(instancedLeaves);

  return tree;
}

/**
 * Creates a natural curved ribbon geometry for arching palm fronds.
 */
function createCurvedFrondRibbonGeo(length: number, width: number, lift: number, droop: number) {
  const segsX = 8;
  const geo = new THREE.PlaneGeometry(length, width, segsX, 1);
  // Shift plane so stem root starts at X=0 and extends to X=length
  geo.translate(length / 2, 0, 0);
  // Lay flat horizontally first (Y becomes width/Z)
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const t = Math.min(1, Math.max(0, x / length));
    // Parabolic arch upward then drooping downward under gravity
    const archY = Math.sin(t * Math.PI * 0.85) * lift + Math.pow(t, 2.2) * droop;
    // Slight V-fold along frond width for realistic rigidity
    const vFoldY = -Math.abs(z) * 0.18;
    pos.setY(i, archY + vFoldY);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Generates a realistic Mediterranean/tropical palm tree with a curved tapered ringed trunk,
 * green crownshaft, coconuts, and 14 arched feathered palm fronds.
 */
export function createRealisticPalmTree(
  ctx: PropBuilderContext,
  barkMat: THREE.Material,
  heightScale = 1.0,
  palmFrondTexture?: THREE.Texture
): THREE.Group {
  const palm = new THREE.Group();

  const crownShaftMat = ctx.registerMat(
    new THREE.MeshStandardMaterial({ color: 0x4b7438, roughness: 0.62, metalness: 0.03 })
  );
  const coconutMat = ctx.registerMat(
    new THREE.MeshStandardMaterial({ color: 0x5d3d22, roughness: 0.72, metalness: 0.04 })
  );
  const frondMat = ctx.registerMat(
    palmFrondTexture
      ? new THREE.MeshStandardMaterial({
          map: palmFrondTexture,
          alphaTest: 0.36,
          side: THREE.DoubleSide,
          roughness: 0.68,
          metalness: 0.04,
        })
      : new THREE.MeshStandardMaterial({
          color: 0x3d7332,
          side: THREE.DoubleSide,
          roughness: 0.7,
          metalness: 0.04,
        })
  );

  // Curved tapered trunk segments
  const trunkCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.07 * heightScale, 0.58 * heightScale, 0.03 * heightScale),
    new THREE.Vector3(0.16 * heightScale, 1.25 * heightScale, 0.06 * heightScale),
    new THREE.Vector3(0.2 * heightScale, 1.92 * heightScale, 0.07 * heightScale),
  ]);

  const segments = 12;
  for (let i = 0; i < segments; i++) {
    const t0 = i / segments;
    const t1 = (i + 1) / segments;
    const p0 = trunkCurve.getPoint(t0);
    const p1 = trunkCurve.getPoint(t1);
    const rBot = (0.095 - t0 * 0.046) * heightScale;
    const rTop = (0.095 - t1 * 0.046) * heightScale;
    const segLen = p0.distanceTo(p1) * 1.06;
    const segGeo = ctx.registerGeo(new THREE.CylinderGeometry(rTop, rBot, segLen, 10));
    const segMesh = new THREE.Mesh(segGeo, i >= segments - 2 ? crownShaftMat : barkMat);
    segMesh.position.copy(p0).lerp(p1, 0.5);
    segMesh.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      p1.clone().sub(p0).normalize()
    );
    segMesh.castShadow = ctx.castShadow;
    segMesh.receiveShadow = ctx.castShadow;
    palm.add(segMesh);
  }

  // Cluster of coconuts nestled right beneath the fronds
  const crownTop = new THREE.Vector3(0.2 * heightScale, 1.9 * heightScale, 0.07 * heightScale);
  const cocoGeo = ctx.registerGeo(new THREE.SphereGeometry(0.046 * heightScale, 10, 8));
  for (let c = 0; c < 5; c++) {
    const angle = (c / 5) * Math.PI * 2;
    const coco = new THREE.Mesh(cocoGeo, coconutMat);
    coco.position.set(
      crownTop.x + Math.cos(angle) * 0.065 * heightScale,
      crownTop.y - 0.09 * heightScale,
      crownTop.z + Math.sin(angle) * 0.065 * heightScale
    );
    coco.scale.set(1, 1.25, 1);
    palm.add(coco);
  }

  // 14 Arching feathered palm fronds in two natural crown tiers
  const upperFrondGeo = ctx.registerGeo(
    createCurvedFrondRibbonGeo(0.95 * heightScale, 0.56 * heightScale, 0.44 * heightScale, -0.18 * heightScale)
  );
  const lowerFrondGeo = ctx.registerGeo(
    createCurvedFrondRibbonGeo(1.12 * heightScale, 0.62 * heightScale, 0.3 * heightScale, -0.44 * heightScale)
  );

  const frondCount = 14;
  for (let f = 0; f < frondCount; f++) {
    const isUpper = f % 2 === 0;
    const yaw = (f / frondCount) * Math.PI * 2 + (isUpper ? 0.22 : 0);
    const frondMesh = new THREE.Mesh(isUpper ? upperFrondGeo : lowerFrondGeo, frondMat);
    frondMesh.position.copy(crownTop);
    frondMesh.position.y += isUpper ? 0.04 * heightScale : -0.02 * heightScale;
    frondMesh.rotation.y = yaw;
    frondMesh.rotation.x = ((f % 3) - 1) * 0.14;
    frondMesh.castShadow = ctx.castShadow;
    frondMesh.receiveShadow = ctx.castShadow;
    palm.add(frondMesh);
  }

  return palm;
}

/**
 * Generates a realistic sculpted luxury sports sedan with aerodynamic side silhouette,
 * beveled wheel arches, tinted panoramic cabin, LED headlights/tail light bar,
 * metallic grille, side mirrors, brake calipers, and 5-spoke star alloy wheels.
 */
export function createRealisticLuxurySedan(
  ctx: PropBuilderContext,
  carPaintMat: THREE.Material,
  chromeMat: THREE.Material,
  glassMat: THREE.Material,
  tireMat: THREE.Material
): THREE.Group {
  const car = new THREE.Group();

  const darkTrimMat = ctx.registerMat(
    new THREE.MeshStandardMaterial({ color: 0x16181f, roughness: 0.5, metalness: 0.28 })
  );
  const darkTintGlassMat = ctx.registerMat(
    new THREE.MeshStandardMaterial({
      color: 0x141d29,
      roughness: 0.06,
      metalness: 0.65,
      transparent: true,
      opacity: 0.86,
    })
  );
  const alloyMat = ctx.registerMat(
    new THREE.MeshStandardMaterial({ color: 0xc9ced6, roughness: 0.22, metalness: 0.88 })
  );
  const brakeCaliperMat = ctx.registerMat(
    new THREE.MeshStandardMaterial({ color: 0xc9252d, roughness: 0.32, metalness: 0.45 })
  );
  const headlightMat = ctx.registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe6f2ff,
      emissiveIntensity: 1.5,
      roughness: 0.15,
    })
  );
  const taillightMat = ctx.registerMat(
    new THREE.MeshStandardMaterial({
      color: 0xff2222,
      emissive: 0xe51a1a,
      emissiveIntensity: 1.35,
      roughness: 0.2,
    })
  );

  // Build sculpted aerodynamic side silhouette (X = Z length after Y-rotation, Y = height)
  // Front faces +Z when rotated -PI/2 around Y. Let's draw profile in local XY where X is forward (+0.74 front, -0.74 rear)
  const halfLen = 0.74;
  const frontWheelX = 0.44;
  const rearWheelX = -0.44;
  const archR = 0.145;

  const bodyShape = new THREE.Shape();
  bodyShape.moveTo(-halfLen, 0.11);
  // Rear bumper & wheel arch cutout
  bodyShape.lineTo(rearWheelX - archR, 0.11);
  bodyShape.absarc(rearWheelX, 0.12, archR, Math.PI, 0, true);
  // Lower rocker panel
  bodyShape.lineTo(frontWheelX - archR, 0.11);
  // Front wheel arch cutout
  bodyShape.absarc(frontWheelX, 0.12, archR, Math.PI, 0, true);
  // Front splitter & nose
  bodyShape.lineTo(halfLen - 0.02, 0.11);
  bodyShape.quadraticCurveTo(halfLen + 0.02, 0.2, halfLen - 0.03, 0.26);
  // Sculpted sloped hood
  bodyShape.lineTo(0.24, 0.32);
  // Raked windshield & curved fastback coupe roofline
  bodyShape.lineTo(0.03, 0.48);
  bodyShape.quadraticCurveTo(-0.14, 0.5, -0.34, 0.44);
  // Rear window slope & ducktail trunk decklid
  bodyShape.lineTo(-0.56, 0.34);
  bodyShape.lineTo(-halfLen + 0.02, 0.32);
  bodyShape.quadraticCurveTo(-halfLen - 0.02, 0.22, -halfLen, 0.11);

  const chassisWidth = 0.62;
  const bodyGeo = ctx.registerGeo(
    new THREE.ExtrudeGeometry(bodyShape, {
      depth: chassisWidth,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.028,
      bevelThickness: 0.032,
    })
  );
  bodyGeo.translate(0, 0, -chassisWidth / 2);
  // Rotate so local +X becomes +Z (facing forward out of driveway!)
  bodyGeo.rotateY(-Math.PI / 2);

  const chassisMesh = new THREE.Mesh(bodyGeo, carPaintMat);
  chassisMesh.castShadow = ctx.castShadow;
  chassisMesh.receiveShadow = ctx.castShadow;
  car.add(chassisMesh);

  // Recessed Dark Tinted Cabin Greenhouse (slightly wider along Z/window glass)
  const glassShape = new THREE.Shape();
  glassShape.moveTo(-0.52, 0.335);
  glassShape.lineTo(0.21, 0.325);
  glassShape.lineTo(0.02, 0.468);
  glassShape.quadraticCurveTo(-0.14, 0.486, -0.33, 0.432);
  glassShape.closePath();

  const glassGeo = ctx.registerGeo(
    new THREE.ExtrudeGeometry(glassShape, {
      depth: 0.58,
      bevelEnabled: true,
      bevelSegments: 2,
      bevelSize: 0.012,
      bevelThickness: 0.012,
    })
  );
  glassGeo.translate(0, 0, -0.29);
  glassGeo.rotateY(-Math.PI / 2);
  const cabinGlassMesh = new THREE.Mesh(glassGeo, darkTintGlassMat);
  car.add(cabinGlassMesh);

  // Dark Lower Rocker Skirts + Front Splitter + Rear Diffuser
  const skirtGeo = ctx.registerGeo(new THREE.BoxGeometry(0.68, 0.04, 1.44));
  const skirtMesh = new THREE.Mesh(skirtGeo, darkTrimMat);
  skirtMesh.position.set(0, 0.1, 0);
  car.add(skirtMesh);

  // Front Fascia: Gloss Black Grille + Chrome Trim Bar + Dual LED Headlights
  const grilleMesh = new THREE.Mesh(
    ctx.registerGeo(new THREE.BoxGeometry(0.34, 0.085, 0.04)),
    darkTrimMat
  );
  grilleMesh.position.set(0, 0.2, 0.745);
  car.add(grilleMesh);

  const grilleBar = new THREE.Mesh(
    ctx.registerGeo(new THREE.BoxGeometry(0.36, 0.014, 0.045)),
    chromeMat
  );
  grilleBar.position.set(0, 0.22, 0.748);
  car.add(grilleBar);

  [-0.24, 0.24].forEach((hx) => {
    const lamp = new THREE.Mesh(
      ctx.registerGeo(new THREE.BoxGeometry(0.13, 0.036, 0.05)),
      headlightMat
    );
    lamp.position.set(hx, 0.235, 0.732);
    lamp.rotation.y = hx > 0 ? -0.18 : 0.18;
    car.add(lamp);
  });

  // Rear Fascia: Full-Width LED Tail Light Bar + Dual Chrome Exhaust Pipes
  const tailBar = new THREE.Mesh(
    ctx.registerGeo(new THREE.BoxGeometry(0.58, 0.032, 0.04)),
    taillightMat
  );
  tailBar.position.set(0, 0.275, -0.745);
  car.add(tailBar);

  [-0.2, 0.2].forEach((ex) => {
    const pipe = new THREE.Mesh(
      ctx.registerGeo(new THREE.CylinderGeometry(0.024, 0.024, 0.06, 10)),
      chromeMat
    );
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(ex, 0.115, -0.755);
    car.add(pipe);
  });

  // Side Wing Mirrors & Flush Chrome Door Handles
  [-0.36, 0.36].forEach((mx) => {
    const mirror = new THREE.Mesh(
      ctx.registerGeo(new THREE.BoxGeometry(0.085, 0.042, 0.058)),
      carPaintMat
    );
    mirror.position.set(mx, 0.335, 0.18);
    mirror.castShadow = ctx.castShadow;
    car.add(mirror);

    const handle = new THREE.Mesh(
      ctx.registerGeo(new THREE.BoxGeometry(0.02, 0.015, 0.085)),
      chromeMat
    );
    handle.position.set(mx * 0.94, 0.28, -0.04);
    car.add(handle);
  });

  // 4 Realistic Multi-Part 5-Spoke Alloy Wheels with Brake Rotors & Red Calipers
  const tireGeo = ctx.registerGeo(new THREE.CylinderGeometry(0.122, 0.122, 0.095, 24));
  tireGeo.rotateZ(Math.PI / 2);
  const wheelWellGeo = ctx.registerGeo(new THREE.CylinderGeometry(0.138, 0.138, 0.11, 18));
  wheelWellGeo.rotateZ(Math.PI / 2);
  const rotorGeo = ctx.registerGeo(new THREE.CylinderGeometry(0.078, 0.078, 0.03, 16));
  rotorGeo.rotateZ(Math.PI / 2);
  const rimBarrelGeo = ctx.registerGeo(new THREE.TorusGeometry(0.082, 0.012, 8, 20));
  rimBarrelGeo.rotateY(Math.PI / 2);
  const spokeGeo = ctx.registerGeo(new THREE.BoxGeometry(0.024, 0.15, 0.02));
  const capGeo = ctx.registerGeo(new THREE.CylinderGeometry(0.025, 0.025, 0.104, 12));
  capGeo.rotateZ(Math.PI / 2);
  const caliperGeo = ctx.registerGeo(new THREE.BoxGeometry(0.035, 0.045, 0.038));

  const wheelCoords: Array<[number, number, number]> = [
    [-0.315, 0.122, frontWheelX],
    [0.315, 0.122, frontWheelX],
    [-0.315, 0.122, rearWheelX],
    [0.315, 0.122, rearWheelX],
  ];

  wheelCoords.forEach(([wx, wy, wz]) => {
    const wheelGroup = new THREE.Group();
    wheelGroup.position.set(wx, wy, wz);
    const sideSign = Math.sign(wx);

    const well = new THREE.Mesh(wheelWellGeo, darkTrimMat);
    well.position.x = -sideSign * 0.02;
    wheelGroup.add(well);

    const tire = new THREE.Mesh(tireGeo, tireMat);
    tire.castShadow = ctx.castShadow;
    wheelGroup.add(tire);

    const rotor = new THREE.Mesh(rotorGeo, alloyMat);
    rotor.position.x = sideSign * 0.015;
    wheelGroup.add(rotor);

    const caliper = new THREE.Mesh(caliperGeo, brakeCaliperMat);
    caliper.position.set(sideSign * 0.026, 0.035, -0.042);
    wheelGroup.add(caliper);

    const barrel = new THREE.Mesh(rimBarrelGeo, alloyMat);
    barrel.position.x = sideSign * 0.046;
    wheelGroup.add(barrel);

    // 5-Spoke Alloy Star
    for (let s = 0; s < 5; s++) {
      const spoke = new THREE.Mesh(spokeGeo, alloyMat);
      spoke.position.x = sideSign * 0.044;
      spoke.rotation.x = (s / 5) * Math.PI * 2;
      wheelGroup.add(spoke);
    }

    const cap = new THREE.Mesh(capGeo, chromeMat);
    wheelGroup.add(cap);

    car.add(wheelGroup);
  });

  // Unused glassMat fallback keeps signature compatible
  void glassMat;

  return car;
}
