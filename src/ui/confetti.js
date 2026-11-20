import Phaser from 'phaser';
import { COLORS } from './theme.js';

const CONFETTI_COLORS = [
  COLORS.gold,
  COLORS.cream,
  COLORS.blue,
  COLORS.red,
  0x7dffa8,
  0xffffff,
];

/** Lluvia de confeti simple con rectángulos/tweens. */
export function spawnConfetti(scene, options = {}) {
  const {
    count = 48,
    x = scene.scale.width / 2,
    y = scene.scale.height * 0.35,
    spread = 220,
  } = options;

  for (let i = 0; i < count; i += 1) {
    const color = Phaser.Utils.Array.GetRandom(CONFETTI_COLORS);
    const piece = scene.add.rectangle(
      x + Phaser.Math.Between(-spread, spread),
      y + Phaser.Math.Between(-40, 40),
      Phaser.Math.Between(6, 12),
      Phaser.Math.Between(8, 16),
      color,
    ).setDepth(1000).setAngle(Phaser.Math.Between(0, 360));

    scene.tweens.add({
      targets: piece,
      y: scene.scale.height + 40,
      x: piece.x + Phaser.Math.Between(-120, 120),
      angle: piece.angle + Phaser.Math.Between(-360, 360),
      alpha: 0,
      duration: Phaser.Math.Between(900, 1600),
      ease: 'Cubic.easeIn',
      onComplete: () => piece.destroy(),
    });
  }
}
