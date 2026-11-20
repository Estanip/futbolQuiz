import { COLORS, FONT } from './theme.js';
import { sfx } from '../audio/sfx.js';

/**
 * Botón rectangular interactivo con hover.
 */
export function createButton(scene, x, y, width, height, label, onClick, options = {}) {
  const {
    fill = COLORS.gold,
    textColor = '#1a1a1a',
    fontSize = '22px',
    silent = false,
  } = options;

  const container = scene.add.container(x, y);

  const bg = scene.add.rectangle(0, 0, width, height, fill, 1)
    .setStrokeStyle(3, COLORS.white, 0.35)
    .setInteractive({ useHandCursor: true });

  const text = scene.add.text(0, 0, label, {
    fontFamily: FONT,
    fontSize,
    fontStyle: '600',
    color: textColor,
    align: 'center',
    wordWrap: { width: width - 24 },
  }).setOrigin(0.5);

  container.add([bg, text]);

  bg.on('pointerover', () => {
    bg.setScale(1.03);
    container.setY(y - 2);
  });
  bg.on('pointerout', () => {
    bg.setScale(1);
    container.setY(y);
  });
  bg.on('pointerdown', () => {
    bg.setScale(0.97);
  });
  bg.on('pointerup', () => {
    bg.setScale(1.03);
    if (!silent) sfx.click();
    onClick();
  });

  return {
    container,
    bg,
    text,
    setEnabled(enabled) {
      bg.disableInteractive();
      if (enabled) {
        bg.setInteractive({ useHandCursor: true });
        bg.setAlpha(1);
        text.setAlpha(1);
      } else {
        bg.setAlpha(0.45);
        text.setAlpha(0.55);
      }
    },
  };
}
