import * as THREE from 'three';

export interface ProceduralTextureSet {
  woodDiffuse: THREE.CanvasTexture;
  woodBump: THREE.CanvasTexture;
  concreteDiffuse: THREE.CanvasTexture;
  concreteBump: THREE.CanvasTexture;
  stoneDiffuse: THREE.CanvasTexture;
  stoneBump: THREE.CanvasTexture;
  terracottaDiffuse: THREE.CanvasTexture;
  terracottaBump: THREE.CanvasTexture;
  brickPaverDiffuse: THREE.CanvasTexture;
  tileFloorDiffuse: THREE.CanvasTexture;
  rugDiffuse: THREE.CanvasTexture;
  marbleDiffuse: THREE.CanvasTexture;
  barkDiffuse: THREE.CanvasTexture;
  barkBump: THREE.CanvasTexture;
  grassDiffuse: THREE.CanvasTexture;
  grassBump: THREE.CanvasTexture;
  leafClusterAlpha: THREE.CanvasTexture;
  palmFrondAlpha: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  dispose: () => void;
}

function finalizeTexture(
  canvas: HTMLCanvasElement,
  maxAnisotropy: number,
  isColor = true,
  repeatX = 1,
  repeatY = 1
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  texture.anisotropy = Math.min(8, Math.max(1, maxAnisotropy));
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(repeatX, repeatY);
  texture.needsUpdate = true;
  return texture;
}

function createWoodCanvases(): { diffuse: HTMLCanvasElement; bump: HTMLCanvasElement } {
  const size = 512;
  const diffuse = document.createElement('canvas');
  diffuse.width = size;
  diffuse.height = size;
  const ctx = diffuse.getContext('2d')!;

  const bump = document.createElement('canvas');
  bump.width = size;
  bump.height = size;
  const bCtx = bump.getContext('2d')!;

  const grad = ctx.createLinearGradient(0, 0, size, 0);
  grad.addColorStop(0, '#cfa679');
  grad.addColorStop(0.5, '#dbb488');
  grad.addColorStop(1, '#c39769');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 200; i++) {
    const x = (i / 200) * size;
    const alpha = 0.045 + ((i * 17) % 10) * 0.012;
    ctx.strokeStyle =
      i % 3 === 0 ? `rgba(88, 52, 22, ${alpha})` : `rgba(248, 225, 192, ${alpha * 0.7})`;
    ctx.lineWidth = 1 + (i % 3);

    bCtx.strokeStyle = i % 3 === 0 ? 'rgba(40,40,40,0.35)' : 'rgba(210,210,210,0.22)';
    bCtx.lineWidth = 1 + (i % 2);

    const drawGrain = (target: CanvasRenderingContext2D) => {
      target.beginPath();
      for (let y = 0; y <= size; y += 16) {
        const wave = Math.sin((y / size) * Math.PI * 2 + i * 0.4) * 3.2;
        if (y === 0) target.moveTo(x + wave, y);
        else target.lineTo(x + wave, y);
      }
      target.stroke();
    };
    drawGrain(ctx);
    drawGrain(bCtx);
  }
  return { diffuse, bump };
}

function createConcreteCanvases(): { diffuse: HTMLCanvasElement; bump: HTMLCanvasElement } {
  const size = 512;
  const diffuse = document.createElement('canvas');
  diffuse.width = size;
  diffuse.height = size;
  const ctx = diffuse.getContext('2d')!;

  const bump = document.createElement('canvas');
  bump.width = size;
  bump.height = size;
  const bCtx = bump.getContext('2d')!;

  ctx.fillStyle = '#e7dfd0';
  ctx.fillRect(0, 0, size, size);

  bCtx.fillStyle = '#888888';
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 1600; i++) {
    const x = (i * 97) % size;
    const y = (i * 193) % size;
    const r = 1 + (i % 3);
    ctx.fillStyle = i % 2 === 0 ? 'rgba(115, 102, 86, 0.055)' : 'rgba(255, 252, 246, 0.07)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    bCtx.fillStyle = i % 2 === 0 ? 'rgba(65,65,65,0.22)' : 'rgba(185,185,185,0.2)';
    bCtx.fillRect(x, y, r, r);
  }

  return { diffuse, bump };
}

function createStackedStoneCanvases(): { diffuse: HTMLCanvasElement; bump: HTMLCanvasElement } {
  const size = 512;
  const diffuse = document.createElement('canvas');
  diffuse.width = size;
  diffuse.height = size;
  const ctx = diffuse.getContext('2d')!;

  const bump = document.createElement('canvas');
  bump.width = size;
  bump.height = size;
  const bCtx = bump.getContext('2d')!;

  ctx.fillStyle = '#2d2a30';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#222222';
  bCtx.fillRect(0, 0, size, size);

  const rows = 14;
  const rowH = size / rows;
  const stoneTones = ['#585358', '#6a646a', '#48444a', '#756f75', '#524e54'];

  for (let r = 0; r < rows; r++) {
    let x = r % 2 === 0 ? 0 : -40;
    while (x < size) {
      const w = 68 + ((r * 31 + Math.abs(x) * 13) % 64);
      const tone = stoneTones[(r + Math.floor(Math.abs(x))) % stoneTones.length];
      ctx.fillStyle = tone;
      ctx.fillRect(x + 2, r * rowH + 2, w - 4, rowH - 4);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.fillRect(x + 2, r * rowH + 2, w - 4, 3);

      const bVal = 140 + ((r * 23 + Math.abs(x)) % 85);
      bCtx.fillStyle = `rgb(${bVal},${bVal},${bVal})`;
      bCtx.fillRect(x + 3, r * rowH + 3, w - 6, rowH - 6);
      x += w;
    }
  }
  return { diffuse, bump };
}

function createTerracottaCanvases(): { diffuse: HTMLCanvasElement; bump: HTMLCanvasElement } {
  const size = 512;
  const diffuse = document.createElement('canvas');
  diffuse.width = size;
  diffuse.height = size;
  const ctx = diffuse.getContext('2d')!;

  const bump = document.createElement('canvas');
  bump.width = size;
  bump.height = size;
  const bCtx = bump.getContext('2d')!;

  ctx.fillStyle = '#8b2f26';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#555555';
  bCtx.fillRect(0, 0, size, size);

  const cols = 16;
  const rows = 12;
  const cw = size / cols;
  const rh = size / rows;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * cw;
      const y = r * rh;
      const grad = ctx.createLinearGradient(x, y, x + cw, y);
      grad.addColorStop(0, '#682019');
      grad.addColorStop(0.5, '#a83c31');
      grad.addColorStop(1, '#5d1b15');
      ctx.fillStyle = grad;
      ctx.fillRect(x + 1, y + 1, cw - 2, rh - 3);

      const bGrad = bCtx.createLinearGradient(x, y, x + cw, y);
      bGrad.addColorStop(0, '#383838');
      bGrad.addColorStop(0.5, '#efefef');
      bGrad.addColorStop(1, '#383838');
      bCtx.fillStyle = bGrad;
      bCtx.fillRect(x + 1, y + 1, cw - 2, rh - 3);
    }
  }
  return { diffuse, bump };
}

function createBarkCanvases(): { diffuse: HTMLCanvasElement; bump: HTMLCanvasElement } {
  const size = 512;
  const diffuse = document.createElement('canvas');
  diffuse.width = size;
  diffuse.height = size;
  const ctx = diffuse.getContext('2d')!;

  const bump = document.createElement('canvas');
  bump.width = size;
  bump.height = size;
  const bCtx = bump.getContext('2d')!;

  ctx.fillStyle = '#4e3b2b';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#686868';
  bCtx.fillRect(0, 0, size, size);

  for (let i = 0; i < 240; i++) {
    const x = (i / 240) * size;
    const isRidge = i % 3 !== 0;
    ctx.strokeStyle = isRidge ? 'rgba(116, 92, 70, 0.45)' : 'rgba(38, 25, 16, 0.58)';
    ctx.lineWidth = 2 + (i % 4);
    bCtx.strokeStyle = isRidge ? 'rgba(220, 220, 220, 0.5)' : 'rgba(30, 30, 30, 0.65)';
    bCtx.lineWidth = 2 + (i % 3);

    const drawFissure = (t: CanvasRenderingContext2D) => {
      t.beginPath();
      for (let y = 0; y <= size; y += 18) {
        const wave = Math.sin((y / size) * Math.PI * 4 + i * 0.7) * 5.5;
        if (y === 0) t.moveTo(x + wave, y);
        else t.lineTo(x + wave, y);
      }
      t.stroke();
    };
    drawFissure(ctx);
    drawFissure(bCtx);
  }
  return { diffuse, bump };
}

function createGrassCanvases(): { diffuse: HTMLCanvasElement; bump: HTMLCanvasElement } {
  const size = 512;
  const diffuse = document.createElement('canvas');
  diffuse.width = size;
  diffuse.height = size;
  const ctx = diffuse.getContext('2d')!;

  const bump = document.createElement('canvas');
  bump.width = size;
  bump.height = size;
  const bCtx = bump.getContext('2d')!;

  ctx.fillStyle = '#3b6431';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#747474';
  bCtx.fillRect(0, 0, size, size);

  const grassTones = ['#2f5527', '#437136', '#51803f', '#38602e', '#5d8b46'];
  for (let i = 0; i < 4200; i++) {
    const x = (i * 137) % size;
    const y = (i * 251) % size;
    const h = 4 + (i % 7);
    const tilt = ((i % 5) - 2) * 1.1;
    ctx.strokeStyle = grassTones[i % grassTones.length];
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + tilt, y - h);
    ctx.stroke();

    const bVal = 90 + (i % 130);
    bCtx.strokeStyle = `rgb(${bVal},${bVal},${bVal})`;
    bCtx.lineWidth = 1.3;
    bCtx.beginPath();
    bCtx.moveTo(x, y);
    bCtx.lineTo(x + tilt, y - h);
    bCtx.stroke();
  }
  return { diffuse, bump };
}

function createLeafClusterAlphaCanvas(): HTMLCanvasElement {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  // Subtle central woody twig stem
  ctx.strokeStyle = '#5b4b32';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(128, 240);
  ctx.quadraticCurveTo(126, 130, 128, 26);
  ctx.stroke();

  // Draw 15 realistic pointed leaves arranged in organic spray
  const leaves: Array<{ x: number; y: number; rot: number; rx: number; ry: number; shade: string }> = [
    { x: 128, y: 34, rot: 0, rx: 22, ry: 34, shade: '#6fa44c' },
    { x: 96, y: 58, rot: -0.65, rx: 21, ry: 33, shade: '#5e9241' },
    { x: 160, y: 58, rot: 0.65, rx: 21, ry: 33, shade: '#679b47' },
    { x: 70, y: 95, rot: -0.95, rx: 23, ry: 35, shade: '#55873a' },
    { x: 186, y: 95, rot: 0.95, rx: 23, ry: 35, shade: '#619644' },
    { x: 128, y: 84, rot: 0.12, rx: 22, ry: 34, shade: '#74aa52' },
    { x: 58, y: 138, rot: -1.15, rx: 24, ry: 36, shade: '#4c7b33' },
    { x: 198, y: 138, rot: 1.15, rx: 24, ry: 36, shade: '#54863b' },
    { x: 102, y: 128, rot: -0.45, rx: 23, ry: 34, shade: '#679d49' },
    { x: 154, y: 128, rot: 0.45, rx: 23, ry: 34, shade: '#5b8f3f' },
    { x: 74, y: 182, rot: -1.0, rx: 22, ry: 33, shade: '#47742f' },
    { x: 182, y: 182, rot: 1.0, rx: 22, ry: 33, shade: '#4d7d34' },
    { x: 112, y: 175, rot: -0.3, rx: 21, ry: 32, shade: '#5f9442' },
    { x: 146, y: 175, rot: 0.3, rx: 21, ry: 32, shade: '#57893b' },
    { x: 128, y: 205, rot: 0.05, rx: 20, ry: 30, shade: '#4b7832' },
  ];

  for (const lf of leaves) {
    ctx.save();
    ctx.translate(lf.x, lf.y);
    ctx.rotate(lf.rot);
    ctx.fillStyle = lf.shade;
    ctx.beginPath();
    ctx.moveTo(0, -lf.ry);
    ctx.quadraticCurveTo(lf.rx, -lf.ry * 0.2, 0, lf.ry);
    ctx.quadraticCurveTo(-lf.rx, -lf.ry * 0.2, 0, -lf.ry);
    ctx.fill();

    // Central leaf vein highlight
    ctx.strokeStyle = 'rgba(182, 224, 134, 0.38)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, lf.ry * 0.75);
    ctx.lineTo(0, -lf.ry * 0.72);
    ctx.stroke();
    ctx.restore();
  }
  return canvas;
}

function createPalmFrondAlphaCanvas(): HTMLCanvasElement {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, size, size);

  // Central arching rachis spine from x=0 to x=256 along y=128
  ctx.strokeStyle = '#537b36';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 128);
  ctx.lineTo(252, 128);
  ctx.stroke();

  // Feathered narrow pinnate palm leaflets along both sides of the spine
  const count = 24;
  for (let i = 1; i < count; i++) {
    const t = i / count;
    const x = t * 246;
    const reach = 108 * Math.sin(Math.pow(t, 0.75) * Math.PI);
    [-1, 1].forEach((side) => {
      ctx.save();
      ctx.translate(x, 128);
      ctx.fillStyle = i % 2 === 0 ? '#4d823b' : '#3d6e2f';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(18, side * reach * 0.55, 34, side * reach);
      ctx.quadraticCurveTo(10, side * reach * 0.45, -4, 0);
      ctx.fill();
      ctx.restore();
    });
  }
  return canvas;
}

function createBrickPaverCanvas(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#8b7766';
  ctx.fillRect(0, 0, size, size);

  const rows = 16;
  const cols = 8;
  const rh = size / rows;
  const cw = size / cols;
  const tones = ['#a48b78', '#987e6b', '#b29985', '#8c7462'];

  for (let r = 0; r < rows; r++) {
    const offset = r % 2 === 0 ? 0 : cw * 0.5;
    for (let c = -1; c <= cols; c++) {
      ctx.fillStyle = tones[(r * 3 + c + 10) % tones.length];
      ctx.fillRect(c * cw + offset + 2, r * rh + 2, cw - 4, rh - 4);
    }
  }
  return canvas;
}

function createTileFloorCanvas(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#e8e2d8';
  ctx.fillRect(0, 0, size, size);

  const tiles = 4;
  const step = size / tiles;
  for (let r = 0; r < tiles; r++) {
    for (let c = 0; c < tiles; c++) {
      ctx.fillStyle = (r + c) % 2 === 0 ? '#f3efe8' : '#ebe5db';
      ctx.fillRect(c * step + 2, r * step + 2, step - 4, step - 4);
    }
  }
  return canvas;
}

function createRugCanvas(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#c8bea9';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 900; i++) {
    const x = (i * 83) % size;
    const y = (i * 157) % size;
    const w = 14 + (i % 24);
    const h = 8 + (i % 16);
    ctx.fillStyle = i % 3 === 0 ? 'rgba(92, 85, 76, 0.28)' : 'rgba(235, 228, 212, 0.36)';
    ctx.fillRect(x, y, w, h);
  }
  ctx.strokeStyle = 'rgba(72, 66, 58, 0.38)';
  ctx.lineWidth = 10;
  ctx.strokeRect(12, 12, size - 24, size - 24);
  return canvas;
}

function createMarbleCanvas(): HTMLCanvasElement {
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f2efe9';
  ctx.fillRect(0, 0, size, size);

  const veins = [
    { offset: 96, amp: 30, width: 3.5 },
    { offset: 245, amp: 38, width: 2.2 },
    { offset: 390, amp: 24, width: 4.0 },
  ];

  for (const v of veins) {
    ctx.beginPath();
    for (let x = 0; x <= size; x += 6) {
      const y =
        v.offset +
        Math.sin((x / size) * Math.PI * 2) * v.amp +
        Math.cos((x / size) * Math.PI * 5) * 8;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.lineWidth = v.width;
    ctx.strokeStyle = 'rgba(165, 134, 96, 0.42)';
    ctx.stroke();
  }
  return canvas;
}

function createContactShadowCanvas(): HTMLCanvasElement {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    12,
    size / 2,
    size / 2,
    size / 2
  );
  grad.addColorStop(0, 'rgba(6, 2, 14, 0.8)');
  grad.addColorStop(0.6, 'rgba(10, 4, 20, 0.36)');
  grad.addColorStop(1, 'rgba(10, 4, 20, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);
  return canvas;
}

export function createProceduralTextureSet(maxAnisotropy: number): ProceduralTextureSet {
  const wood = createWoodCanvases();
  const concrete = createConcreteCanvases();
  const stone = createStackedStoneCanvases();
  const terracotta = createTerracottaCanvases();
  const bark = createBarkCanvases();
  const grass = createGrassCanvases();

  const woodDiffuse = finalizeTexture(wood.diffuse, maxAnisotropy, true, 1, 1);
  const woodBump = finalizeTexture(wood.bump, maxAnisotropy, false, 1, 1);
  const concreteDiffuse = finalizeTexture(concrete.diffuse, maxAnisotropy, true, 1, 1);
  const concreteBump = finalizeTexture(concrete.bump, maxAnisotropy, false, 1, 1);
  const stoneDiffuse = finalizeTexture(stone.diffuse, maxAnisotropy, true, 1, 1);
  const stoneBump = finalizeTexture(stone.bump, maxAnisotropy, false, 1, 1);
  const terracottaDiffuse = finalizeTexture(terracotta.diffuse, maxAnisotropy, true, 2, 2);
  const terracottaBump = finalizeTexture(terracotta.bump, maxAnisotropy, false, 2, 2);
  const brickPaverDiffuse = finalizeTexture(createBrickPaverCanvas(), maxAnisotropy, true, 2, 2);
  const tileFloorDiffuse = finalizeTexture(createTileFloorCanvas(), maxAnisotropy, true, 2, 2);
  const rugDiffuse = finalizeTexture(createRugCanvas(), maxAnisotropy, true, 1, 1);
  const marbleDiffuse = finalizeTexture(createMarbleCanvas(), maxAnisotropy, true, 1, 1);

  const barkDiffuse = finalizeTexture(bark.diffuse, maxAnisotropy, true, 2, 3);
  const barkBump = finalizeTexture(bark.bump, maxAnisotropy, false, 2, 3);
  const grassDiffuse = finalizeTexture(grass.diffuse, maxAnisotropy, true, 6, 5);
  const grassBump = finalizeTexture(grass.bump, maxAnisotropy, false, 6, 5);

  const leafClusterAlpha = finalizeTexture(createLeafClusterAlphaCanvas(), maxAnisotropy, true, 1, 1);
  leafClusterAlpha.wrapS = THREE.ClampToEdgeWrapping;
  leafClusterAlpha.wrapT = THREE.ClampToEdgeWrapping;

  const palmFrondAlpha = finalizeTexture(createPalmFrondAlphaCanvas(), maxAnisotropy, true, 1, 1);
  palmFrondAlpha.wrapS = THREE.ClampToEdgeWrapping;
  palmFrondAlpha.wrapT = THREE.ClampToEdgeWrapping;

  const contactShadow = finalizeTexture(createContactShadowCanvas(), maxAnisotropy, true, 1, 1);
  contactShadow.wrapS = THREE.ClampToEdgeWrapping;
  contactShadow.wrapT = THREE.ClampToEdgeWrapping;

  return {
    woodDiffuse,
    woodBump,
    concreteDiffuse,
    concreteBump,
    stoneDiffuse,
    stoneBump,
    terracottaDiffuse,
    terracottaBump,
    brickPaverDiffuse,
    tileFloorDiffuse,
    rugDiffuse,
    marbleDiffuse,
    barkDiffuse,
    barkBump,
    grassDiffuse,
    grassBump,
    leafClusterAlpha,
    palmFrondAlpha,
    contactShadow,
    dispose: () => {
      woodDiffuse.dispose();
      woodBump.dispose();
      concreteDiffuse.dispose();
      concreteBump.dispose();
      stoneDiffuse.dispose();
      stoneBump.dispose();
      terracottaDiffuse.dispose();
      terracottaBump.dispose();
      brickPaverDiffuse.dispose();
      tileFloorDiffuse.dispose();
      rugDiffuse.dispose();
      marbleDiffuse.dispose();
      barkDiffuse.dispose();
      barkBump.dispose();
      grassDiffuse.dispose();
      grassBump.dispose();
      leafClusterAlpha.dispose();
      palmFrondAlpha.dispose();
      contactShadow.dispose();
    },
  };
}
