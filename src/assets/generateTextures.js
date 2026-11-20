/** Genera texturas procedurales para el MVP (sin assets externos). */

export function generateTextures(scene) {
  makeBall(scene);
  makeKeeper(scene);
  makeHeart(scene);
  makeCrowd(scene);
}

function makeBall(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const r = 32;
  g.fillStyle(0xf4f0e6, 1);
  g.fillCircle(r, r, r);
  g.lineStyle(3, 0x222222, 1);
  g.strokeCircle(r, r, r - 1);
  // pentagon-ish patches
  g.fillStyle(0x222222, 1);
  g.fillCircle(r, r - 10, 6);
  g.lineStyle(2, 0x222222, 1);
  g.beginPath();
  g.moveTo(r, r - 4);
  g.lineTo(r + 14, r + 6);
  g.lineTo(r + 8, r + 18);
  g.lineTo(r - 8, r + 18);
  g.lineTo(r - 14, r + 6);
  g.closePath();
  g.strokePath();
  g.generateTexture('ball', r * 2, r * 2);
  g.destroy();
}

function makeKeeper(scene) {
  const w = 64;
  const h = 96;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });

  // legs
  g.fillStyle(0x1a1a1a, 1);
  g.fillRoundedRect(18, 70, 12, 24, 4);
  g.fillRoundedRect(34, 70, 12, 24, 4);

  // body (jersey)
  g.fillStyle(0x2f6fed, 1);
  g.fillRoundedRect(14, 34, 36, 40, 8);
  g.fillStyle(0xffffff, 1);
  g.fillRect(28, 34, 8, 40);

  // arms
  g.fillStyle(0xf1c27d, 1);
  g.fillRoundedRect(2, 38, 14, 10, 4);
  g.fillRoundedRect(48, 38, 14, 10, 4);

  // gloves
  g.fillStyle(0xf0c75e, 1);
  g.fillCircle(6, 42, 8);
  g.fillCircle(58, 42, 8);

  // head
  g.fillStyle(0xf1c27d, 1);
  g.fillCircle(32, 22, 14);
  // hair
  g.fillStyle(0x3b2a1a, 1);
  g.fillEllipse(32, 14, 28, 14);

  g.generateTexture('keeper', w, h);
  g.destroy();
}

function makeHeart(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  const size = 28;
  g.fillStyle(0xe85d4c, 1);
  g.fillCircle(9, 10, 8);
  g.fillCircle(19, 10, 8);
  g.fillTriangle(2, 12, 26, 12, 14, 26);
  g.generateTexture('heart', size, size);
  g.destroy();

  const empty = scene.make.graphics({ x: 0, y: 0, add: false });
  empty.lineStyle(2, 0xe85d4c, 0.55);
  empty.strokeCircle(9, 10, 8);
  empty.strokeCircle(19, 10, 8);
  empty.lineBetween(2, 12, 14, 26);
  empty.lineBetween(26, 12, 14, 26);
  empty.generateTexture('heart-empty', size, size);
  empty.destroy();
}

function makeCrowd(scene) {
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  g.fillStyle(0x0a1620, 1);
  g.fillRect(0, 0, 64, 32);
  const colors = [0xe85d4c, 0x2f6fed, 0xf0c75e, 0xffffff, 0x7dffa8];
  for (let i = 0; i < 18; i += 1) {
    g.fillStyle(colors[i % colors.length], 0.55);
    g.fillCircle(4 + (i % 9) * 7, 10 + Math.floor(i / 9) * 12, 3);
  }
  g.generateTexture('crowd', 64, 32);
  g.destroy();
}
