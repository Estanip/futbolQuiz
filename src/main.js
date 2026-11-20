import Phaser from 'phaser';
import BootScene from './scenes/BootScene.js';
import MenuScene from './scenes/MenuScene.js';
import QuizScene from './scenes/QuizScene.js';
import PenaltyScene from './scenes/PenaltyScene.js';
import GameOverScene from './scenes/GameOverScene.js';

/** Canvas vertical pensado para celular; en desktop se agranda con FIT. */
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#0b1f14',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 430,
    height: 780,
    min: { width: 320, height: 560 },
    max: { width: 900, height: 1600 },
  },
  scene: [BootScene, MenuScene, QuizScene, PenaltyScene, GameOverScene],
  input: {
    activePointers: 2,
  },
};

// eslint-disable-next-line no-new
new Phaser.Game(config);
