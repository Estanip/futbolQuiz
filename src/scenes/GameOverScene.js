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
    const panelW = Math.min(360, width - 36);
    const btnW = Math.min(300, width - 48);

    if (this.cleared || result.isNewRecord) sfx.win();
    else sfx.gameOver();

    const g = this.add.graphics();
    g.fillStyle(COLORS.pitchDark, 1);
    g.fillRect(0, 0, width, height);

    if (this.cleared || result.isNewRecord) {
      spawnConfetti(this, { count: 48, y: height * 0.18 });
    }

    this.add.image(width / 2, height * 0.1, this.cleared ? 'ball' : 'keeper')
      .setScale(this.cleared ? 0.65 : 0.85)
      .setAlpha(0.9);

    let title = this.cleared ? '¡PARTIDA COMPLETA!' : 'FIN DEL PARTIDO';
    if (result.isNewRecord) title = '¡NUEVO RÉCORD!';

    const subtitle = this.cleared
      ? `Terminaste la partida ${gameState.modeLabel().toLowerCase()}.`
      : 'Te quedaste sin vidas.';

    this.add.text(width / 2, height * 0.2, title, {
      fontFamily: FONT,
      fontSize: '30px',
      fontStyle: '800',
      color: result.isNewRecord || this.cleared ? '#7dffa8' : '#f4f0e6',
      align: 'center',
      wordWrap: { width: width - 40 },
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.27, subtitle, {
      fontFamily: FONT,
      fontSize: '15px',
      color: '#b7c9b0',
      align: 'center',
      wordWrap: { width: width - 40 },
    }).setOrigin(0.5);

    const panel = this.add.rectangle(width / 2, height * 0.48, panelW, 190, COLORS.panel, 0.95)
      .setStrokeStyle(2, COLORS.panelBorder);

    this.add.text(panel.x, panel.y - 66, `Modo ${gameState.modeLabel()}`, {
      fontFamily: FONT,
      fontSize: '15px',
      color: '#f0c75e',
    }).setOrigin(0.5);

    this.add.text(panel.x, panel.y - 28, 'Puntaje', {
      fontFamily: FONT,
      fontSize: '14px',
      color: '#b7c9b0',
    }).setOrigin(0.5);

    this.add.text(panel.x, panel.y + 14, `${gameState.score}`, {
      fontFamily: FONT,
      fontSize: '48px',
      fontStyle: '800',
      color: '#f0c75e',
    }).setOrigin(0.5);

    this.add.text(
      panel.x,
      panel.y + 64,
      `Racha: ${gameState.bestStreak}  ·  Récord: ${result.records[gameState.mode]}`,
      {
        fontFamily: FONT,
        fontSize: '13px',
        color: '#b7c9b0',
      },
    ).setOrigin(0.5);

    createButton(this, width / 2, height * 0.7, btnW, 58, 'REINTENTAR', () => {
      sfx.whistle();
      gameState.reset(gameState.mode);
      this.scene.start('QuizScene');
    }, { fontSize: '18px' });

    createButton(this, width / 2, height * 0.82, btnW, 50, 'Menú / cambiar modo', () => {
      this.scene.start('MenuScene');
    }, { fill: COLORS.panel, textColor: '#f4f0e6', fontSize: '16px' });
  }
}
