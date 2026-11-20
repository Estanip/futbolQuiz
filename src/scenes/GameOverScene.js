import Phaser from 'phaser';
import { gameState } from '../state/gameState.js';
import { saveScore } from '../state/storage.js';
import { COLORS, FONT } from '../ui/theme.js';
import { createButton } from '../ui/button.js';
import { sfx } from '../audio/sfx.js';
import { spawnConfetti } from '../ui/confetti.js';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.cleared = Boolean(data?.cleared);
  }

  create() {
    const { width, height } = this.scale;
    const result = saveScore(gameState.mode, gameState.score);

    if (this.cleared || result.isNewRecord) sfx.win();
    else sfx.gameOver();

    const g = this.add.graphics();
    g.fillStyle(COLORS.pitchDark, 1);
    g.fillRect(0, 0, width, height);

    if (this.cleared || result.isNewRecord) {
      spawnConfetti(this, { count: 56, y: height * 0.2 });
    }

    this.add.image(width / 2, height * 0.11, this.cleared ? 'ball' : 'keeper')
      .setScale(this.cleared ? 0.7 : 0.95)
      .setAlpha(0.9);

    let title = this.cleared ? '¡PARTIDA COMPLETA!' : 'FIN DEL PARTIDO';
    if (result.isNewRecord) title = '¡NUEVO RÉCORD!';

    const subtitle = this.cleared
      ? `Terminaste la partida ${gameState.modeLabel().toLowerCase()}.`
      : 'Te quedaste sin vidas.';

    this.add.text(width / 2, height * 0.22, title, {
      fontFamily: FONT,
      fontSize: '40px',
      fontStyle: '800',
      color: result.isNewRecord || this.cleared ? '#7dffa8' : '#f4f0e6',
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.30, subtitle, {
      fontFamily: FONT,
      fontSize: '18px',
      color: '#b7c9b0',
    }).setOrigin(0.5);

    const panel = this.add.rectangle(width / 2, height * 0.50, 400, 200, COLORS.panel, 0.95)
      .setStrokeStyle(2, COLORS.panelBorder);

    this.add.text(panel.x, panel.y - 70, `Modo ${gameState.modeLabel()}`, {
      fontFamily: FONT,
      fontSize: '16px',
      color: '#f0c75e',
    }).setOrigin(0.5);

    this.add.text(panel.x, panel.y - 30, 'Puntaje', {
      fontFamily: FONT,
      fontSize: '16px',
      color: '#b7c9b0',
    }).setOrigin(0.5);

    this.add.text(panel.x, panel.y + 10, `${gameState.score}`, {
      fontFamily: FONT,
      fontSize: '52px',
      fontStyle: '800',
      color: '#f0c75e',
    }).setOrigin(0.5);

    this.add.text(
      panel.x,
      panel.y + 62,
      `Racha máx: ${gameState.bestStreak}   ·   Récord: ${result.records[gameState.mode]}`,
      {
        fontFamily: FONT,
        fontSize: '15px',
        color: '#b7c9b0',
      },
    ).setOrigin(0.5);

    createButton(this, width / 2, height * 0.72, 280, 60, 'REINTENTAR', () => {
      sfx.whistle();
      gameState.reset(gameState.mode);
      this.scene.start('QuizScene');
    });

    createButton(this, width / 2, height * 0.84, 280, 50, 'Menú / cambiar modo', () => {
      this.scene.start('MenuScene');
    }, { fill: COLORS.panel, textColor: '#f4f0e6', fontSize: '17px' });
  }
}
