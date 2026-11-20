import Phaser from 'phaser';
import { gameState, QUESTION_TIME } from '../state/gameState.js';
import { COLORS, FONT } from '../ui/theme.js';
import { createButton } from '../ui/button.js';
import { sfx } from '../audio/sfx.js';

const CATEGORY_COLOR = {
  Mundial: '#f0c75e',
  Selección: '#7db7ff',
  Clubes: '#7dffa8',
};

export default class QuizScene extends Phaser.Scene {
  constructor() {
    super('QuizScene');
  }

  create() {
    this.answered = false;
    this.timeLeft = QUESTION_TIME;

    if (gameState.isGameOver()) {
      this.scene.start('GameOverScene');
      return;
    }

    if (!gameState.hasMoreQuestions()) {
      this.scene.start('GameOverScene', { cleared: true });
      return;
    }

    const q = gameState.currentQuestion();
    const { width, height } = this.scale;
    const contentW = Math.min(380, width - 32);

    this.drawBackground();
    this.drawHud();

    const catColor = CATEGORY_COLOR[q.category] || '#f0c75e';
    const catBg = this.add.rectangle(width / 2, 100, 150, 26, COLORS.panel, 0.95)
      .setStrokeStyle(1, COLORS.panelBorder);
    this.add.text(catBg.x, catBg.y, q.category.toUpperCase(), {
      fontFamily: FONT,
      fontSize: '13px',
      fontStyle: '700',
      color: catColor,
    }).setOrigin(0.5);

    this.add.text(width / 2, 128, q.question, {
      fontFamily: FONT,
      fontSize: '20px',
      fontStyle: '600',
      color: '#f4f0e6',
      align: 'center',
      wordWrap: { width: contentW },
    }).setOrigin(0.5, 0);

    this.buttons = [];
    const startY = 300;
    const gap = 78;
    const btnW = contentW;

    q.options.forEach((option, index) => {
      const btn = createButton(
        this,
        width / 2,
        startY + index * gap,
        btnW,
        64,
        option,
        () => this.handleAnswer(index),
        { fill: COLORS.panel, textColor: '#f4f0e6', fontSize: '17px' },
      );
      btn.bg.setStrokeStyle(2, COLORS.panelBorder);
      this.buttons.push(btn);
    });

    this.createTimerUi();
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      repeat: QUESTION_TIME - 1,
      callback: () => this.onTick(),
    });
  }

  drawBackground() {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    g.fillStyle(COLORS.pitchDark, 1);
    g.fillRect(0, 0, width, height);
    g.fillStyle(COLORS.pitch, 0.45);
    g.fillRoundedRect(12, 72, width - 24, height - 90, 16);
  }

  drawHud() {
    const { width } = this.scale;

    this.add.text(16, 18, `${gameState.score}`, {
      fontFamily: FONT,
      fontSize: '20px',
      fontStyle: '700',
      color: '#f4f0e6',
    });

    this.add.text(width / 2, 18, `${gameState.modeLabel()} · x${gameState.streak}`, {
      fontFamily: FONT,
      fontSize: '14px',
      color: '#b7c9b0',
    }).setOrigin(0.5, 0);

    const heartsX = width - 96;
    for (let i = 0; i < 3; i += 1) {
      const key = i < gameState.lives ? 'heart' : 'heart-empty';
      this.add.image(heartsX + i * 30, 30, key).setScale(0.78);
    }

    this.add.text(width - 16, 50, gameState.progressLabel(), {
      fontFamily: FONT,
      fontSize: '12px',
      color: '#6f8f78',
    }).setOrigin(1, 0);
  }

  createTimerUi() {
    const { width } = this.scale;
    const barW = Math.min(380, width - 32);
    const x = width / 2;
    const y = 250;

    this.timerChip = this.add.container(x, y - 26);
    const chipBg = this.add.rectangle(0, 0, 64, 26, 0x0a1a10, 1)
      .setStrokeStyle(2, COLORS.gold);
    this.timerText = this.add.text(0, 0, `${this.timeLeft}`, {
      fontFamily: FONT,
      fontSize: '17px',
      fontStyle: '800',
      color: '#f0c75e',
    }).setOrigin(0.5);
    this.timerChip.add([chipBg, this.timerText]);
    this.timerChipBg = chipBg;

    this.add.rectangle(x, y, barW, 14, 0x0a1a10, 1).setStrokeStyle(2, COLORS.panelBorder);
    this.timerBar = this.add.rectangle(x - barW / 2, y, barW, 8, COLORS.gold, 1).setOrigin(0, 0.5);
    this.timerBarMax = barW;
  }

  onTick() {
    if (this.answered) return;
    this.timeLeft -= 1;
    this.timerText.setText(`${this.timeLeft}`);

    const ratio = this.timeLeft / QUESTION_TIME;
    this.tweens.add({
      targets: this.timerBar,
      width: Math.max(2, ratio * this.timerBarMax),
      duration: 220,
      ease: 'Sine.easeOut',
    });

    if (this.timeLeft <= 5) {
      const danger = this.timeLeft <= 3;
      this.timerBar.setFillStyle(danger ? COLORS.red : 0xffb347, 1);
      this.timerText.setColor(danger ? '#ffb4a8' : '#ffd27a');
      this.timerChipBg.setStrokeStyle(2, danger ? COLORS.red : 0xffb347);
      this.tweens.add({
        targets: this.timerChip,
        scale: 1.12,
        duration: 100,
        yoyo: true,
      });
      if (danger) sfx.tick();
    }

    if (this.timeLeft <= 0) {
      this.handleTimeout();
    }
  }

  stopTimer() {
    if (this.timerEvent) {
      this.timerEvent.remove(false);
      this.timerEvent = null;
    }
  }

  handleTimeout() {
    if (this.answered) return;
    this.answered = true;
    this.stopTimer();
    this.buttons.forEach((b) => b.setEnabled(false));

    const q = gameState.currentQuestion();
    this.buttons[q.answer].bg.setFillStyle(0x2f9e5d, 1);

    sfx.wrong();
    this.showFeedback('¡Tiempo! Al penal…', '#ffb4a8');

    this.time.delayedCall(900, () => {
      gameState.markWrongAnswer();
      this.scene.start('PenaltyScene');
    });
  }

  handleAnswer(index) {
    if (this.answered) return;
    this.answered = true;
    this.stopTimer();
    this.buttons.forEach((b) => b.setEnabled(false));

    const q = gameState.currentQuestion();
    const correct = index === q.answer;

    this.buttons.forEach((b, i) => {
      if (i === q.answer) b.bg.setFillStyle(0x2f9e5d, 1);
      else if (i === index && !correct) b.bg.setFillStyle(COLORS.red, 1);
    });

    if (correct) {
      sfx.correct();
      const bonus = Math.round(this.timeLeft * 5);
      this.showFeedback(`¡Correcto! +${100 + gameState.streak * 25 + bonus}`, '#7dffa8');
    } else {
      sfx.wrong();
      this.showFeedback('Fallaste… ¡al penal!', '#ffb4a8');
    }

    this.time.delayedCall(900, () => {
      if (correct) {
        gameState.answerCorrect(this.timeLeft);
        this.scene.start('QuizScene');
      } else {
        gameState.markWrongAnswer();
        this.scene.start('PenaltyScene');
      }
    });
  }

  showFeedback(message, color) {
    const { width, height } = this.scale;
    const feedback = this.add.text(width / 2, height - 42, message, {
      fontFamily: FONT,
      fontSize: '18px',
      fontStyle: '700',
      color,
      wordWrap: { width: width - 24 },
      align: 'center',
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: feedback,
      alpha: 1,
      y: height - 50,
      duration: 250,
    });
  }
}
