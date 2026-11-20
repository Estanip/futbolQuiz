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

    this.drawPitchBackground();

    this.add.image(70, height * 0.12, 'ball').setScale(0.45).setAlpha(0.85);
    this.add.image(width - 70, height * 0.13, 'keeper').setScale(0.58).setAlpha(0.85);

    this.add.text(width / 2, height * 0.11, 'QUIZ DE FÚTBOL', {
      fontFamily: FONT,
      fontSize: '48px',
      fontStyle: '800',
      color: '#f4f0e6',
      stroke: '#0b1f14',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.19, 'Respondé. Si errás, pateá el penal.', {
      fontFamily: FONT,
      fontSize: '18px',
      color: '#b7c9b0',
    }).setOrigin(0.5);

    // Records panel
    const rec = this.add.rectangle(width / 2, height * 0.32, 520, 70, COLORS.panel, 0.92)
      .setStrokeStyle(2, COLORS.panelBorder);
    this.add.text(rec.x, rec.y - 16, 'Récords locales', {
      fontFamily: FONT,
      fontSize: '14px',
      color: '#f0c75e',
    }).setOrigin(0.5);
    this.add.text(rec.x, rec.y + 12, `Rápida: ${records.quick}   ·   Infinito: ${records.infinite}`, {
      fontFamily: FONT,
      fontSize: '20px',
      fontStyle: '600',
      color: '#f4f0e6',
    }).setOrigin(0.5);

    // Mode buttons
    createButton(this, width / 2, height * 0.48, 320, 64, 'PARTIDA RÁPIDA (10)', () => {
      this.startMode(MODES.quick);
    });

    createButton(this, width / 2, height * 0.60, 320, 64, 'MODO INFINITO', () => {
      this.startMode(MODES.infinite);
    }, { fill: 0x2f6fed, textColor: '#f4f0e6' });

    const tips = this.add.rectangle(width / 2, height * 0.78, 560, 110, COLORS.panel, 0.88)
      .setStrokeStyle(2, COLORS.panelBorder);
    this.add.text(tips.x, tips.y - 28, 'Tips', {
      fontFamily: FONT,
      fontSize: '14px',
      color: '#f0c75e',
    }).setOrigin(0.5);
    this.add.text(
      tips.x,
      tips.y + 14,
      '3 vidas · 12s · categorías Selección / Clubes / Mundial\nPenal: apuntá + potencia · la racha endurece al arquero',
      {
        fontFamily: FONT,
        fontSize: '15px',
        color: '#f4f0e6',
        align: 'center',
        lineSpacing: 6,
      },
    ).setOrigin(0.5);

    this.add.text(width / 2, height * 0.94, 'Phaser 3', {
      fontFamily: FONT,
      fontSize: '13px',
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
    g.strokeCircle(width / 2, height / 2, 90);
    g.strokeRect(40, 40, width - 80, height - 80);
  }
}
