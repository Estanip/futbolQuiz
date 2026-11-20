import Phaser from 'phaser';
import { gameState, MODES } from '../state/gameState.js';
import { loadRecords } from '../state/storage.js';
import { COLORS, FONT } from '../ui/theme.js';
import { createButton } from '../ui/button.js';
import { sfx } from '../audio/sfx.js';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const records = loadRecords();
    const panelW = Math.min(380, width - 36);
    const btnW = Math.min(320, width - 48);

    this.drawPitchBackground();

    this.add.image(36, height * 0.09, 'ball').setScale(0.38).setAlpha(0.85);
    this.add.image(width - 36, height * 0.1, 'keeper').setScale(0.48).setAlpha(0.85);

    this.add.text(width / 2, height * 0.09, 'QUIZ DE FÚTBOL', {
      fontFamily: FONT,
      fontSize: width < 400 ? '34px' : '40px',
      fontStyle: '800',
      color: '#f4f0e6',
      stroke: '#0b1f14',
      strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.155, 'Respondé. Si errás, pateá el penal.', {
      fontFamily: FONT,
      fontSize: '15px',
      color: '#b7c9b0',
      align: 'center',
      wordWrap: { width: width - 40 },
    }).setOrigin(0.5);

    const rec = this.add.rectangle(width / 2, height * 0.26, panelW, 72, COLORS.panel, 0.92)
      .setStrokeStyle(2, COLORS.panelBorder);
    this.add.text(rec.x, rec.y - 16, 'Récords locales', {
      fontFamily: FONT,
      fontSize: '13px',
      color: '#f0c75e',
    }).setOrigin(0.5);
    this.add.text(rec.x, rec.y + 14, `Rápida: ${records.quick}  ·  Infinito: ${records.infinite}`, {
      fontFamily: FONT,
      fontSize: '17px',
      fontStyle: '600',
      color: '#f4f0e6',
    }).setOrigin(0.5);

    createButton(this, width / 2, height * 0.42, btnW, 60, 'PARTIDA RÁPIDA (10)', () => {
      this.startMode(MODES.quick);
    }, { fontSize: '18px' });

    createButton(this, width / 2, height * 0.53, btnW, 60, 'MODO INFINITO', () => {
      this.startMode(MODES.infinite);
    }, { fill: 0x2f6fed, textColor: '#f4f0e6', fontSize: '18px' });

    const tips = this.add.rectangle(width / 2, height * 0.72, panelW, 130, COLORS.panel, 0.88)
      .setStrokeStyle(2, COLORS.panelBorder);
    this.add.text(tips.x, tips.y - 42, 'Tips', {
      fontFamily: FONT,
      fontSize: '13px',
      color: '#f0c75e',
    }).setOrigin(0.5);
    this.add.text(
      tips.x,
      tips.y + 10,
      '3 vidas · 12s por pregunta\nSelección / Clubes / Mundial\nPenal: puntería + potencia\nRojo + punta = se va afuera',
      {
        fontFamily: FONT,
        fontSize: '14px',
        color: '#f4f0e6',
        align: 'center',
        lineSpacing: 5,
      },
    ).setOrigin(0.5);

    this.add.text(width / 2, height * 0.94, 'Phaser 3', {
      fontFamily: FONT,
      fontSize: '12px',
      color: '#6f8f78',
    }).setOrigin(0.5);
  }

  startMode(mode) {
    sfx.unlock();
    sfx.whistle();
    gameState.reset(mode);
    this.scene.start('QuizScene');
  }

  drawPitchBackground() {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    g.fillStyle(COLORS.pitchDark, 1);
    g.fillRect(0, 0, width, height);

    const stripeH = 48;
    for (let y = 0; y < height; y += stripeH * 2) {
      g.fillStyle(COLORS.grassStripe, 0.35);
      g.fillRect(0, y, width, stripeH);
    }

    g.lineStyle(3, COLORS.cream, 0.15);
    g.strokeCircle(width / 2, height / 2, 70);
    g.strokeRect(16, 16, width - 32, height - 32);
  }
}
