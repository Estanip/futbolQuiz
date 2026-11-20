import Phaser from 'phaser';
import { gameState } from '../state/gameState.js';
import { COLORS, FONT } from '../ui/theme.js';
import { createButton } from '../ui/button.js';
import { sfx } from '../audio/sfx.js';
import { spawnConfetti } from '../ui/confetti.js';

/**
 * Penal con habilidad:
 * 1) Apuntar (cruz móvil en el arco) → click / espacio
 * 2) Potencia (barra oscilante) → click / espacio
 * El arquero reacciona con delay y alcance limitado: ángulos + potencia alta = más difícil.
 */
export default class PenaltyScene extends Phaser.Scene {
  constructor() {
    super('PenaltyScene');
  }

  create() {
    const { width, height } = this.scale;

    this.phase = 'aim'; // aim | power | shot
    this.aimX = 0;
    this.aimY = 0;
    this.power = 0.5;
    this.lockedAim = null;

    sfx.whistle();
    this.drawStadium();

    this.add.text(width / 2, 28, 'PENAL · SEGUNDA OPORTUNIDAD', {
      fontFamily: FONT,
      fontSize: '22px',
      fontStyle: '700',
      color: '#f0c75e',
    }).setOrigin(0.5);

    const diff = gameState.keeperDifficulty();
    const diffLabel = diff < 0.25 ? 'Arquero normal' : diff < 0.55 ? 'Arquero atento' : diff < 0.8 ? 'Arquero caliente' : 'Arquero modo Diluvio';

    this.subtitle = this.add.text(width / 2, 52, '1/2 · Apuntá: click o ESPACIO cuando la mira esté donde querés', {
      fontFamily: FONT,
      fontSize: '14px',
      color: '#b7c9b0',
      align: 'center',
      wordWrap: { width: width - 80 },
    }).setOrigin(0.5);

    this.add.text(width / 2, 74, `${diffLabel} · racha ${gameState.streak}`, {
      fontFamily: FONT,
      fontSize: '13px',
      color: diff >= 0.55 ? '#ffb4a8' : '#f0c75e',
    }).setOrigin(0.5);

    const heartsX = width - 108;
    for (let i = 0; i < 3; i += 1) {
      const key = i < gameState.lives ? 'heart' : 'heart-empty';
      this.add.image(heartsX + i * 34, 32, key).setScale(0.85);
    }

    this.goalY = 150;
    this.goalWidth = 460;
    this.goalHeight = 175;
    this.goalX = width / 2;
    this.goalLeft = this.goalX - this.goalWidth / 2;
    this.goalRight = this.goalX + this.goalWidth / 2;
    this.goalTop = this.goalY + 18;
    this.goalBottom = this.goalY + this.goalHeight - 18;

    this.drawGoal();

    this.keeperHomeX = this.goalX;
    this.keeper = this.add.image(this.goalX, this.goalY + 82, 'keeper').setScale(1.15);
    this.ball = this.add.image(width / 2, height - 150, 'ball').setScale(0.7);
    this.add.circle(width / 2, height - 150, 5, COLORS.white, 0.7);

    // Aim crosshair
    this.crosshair = this.add.container(this.goalX, this.goalY + this.goalHeight * 0.55);
    const ring = this.add.circle(0, 0, 16, 0x000000, 0).setStrokeStyle(3, COLORS.gold);
    const dot = this.add.circle(0, 0, 4, COLORS.gold);
    const hLine = this.add.rectangle(0, 0, 36, 2, COLORS.gold, 0.9);
    const vLine = this.add.rectangle(0, 0, 2, 36, COLORS.gold, 0.9);
    this.crosshair.add([ring, hLine, vLine, dot]);

    this.hint = this.add.text(width / 2, height - 118, '¡Fijá la puntería!', {
      fontFamily: FONT,
      fontSize: '20px',
      fontStyle: '600',
      color: '#f4f0e6',
    }).setOrigin(0.5);

    this.actionBtn = createButton(
      this,
      width / 2,
      height - 48,
      280,
      54,
      'FIJAR PUNTERÍA',
      () => this.onAction(),
      { fill: COLORS.gold, textColor: '#1a1a1a', fontSize: '18px' },
    );

    this.createPowerUi(false);

    this.keeperIdle = this.tweens.add({
      targets: this.keeper,
      x: this.goalX + 16,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.startAimSweep();

    this.input.keyboard?.on('keydown-SPACE', this.onAction, this);
    this.input.on('pointerdown', (pointer) => {
      // Ignore clicks on UI button area handled by button; allow pitch clicks
      if (this.phase === 'shot') return;
      if (pointer.y > height - 90) return;
      this.onAction();
    });
  }

  createPowerUi(visible) {
    const { width, height } = this.scale;
    const barW = 280;
    const barH = 22;
    const x = width / 2;
    const y = height - 168;

    this.powerLabel = this.add.text(x, y - 28, 'POTENCIA', {
      fontFamily: FONT,
      fontSize: '14px',
      fontStyle: '600',
      color: '#f0c75e',
    }).setOrigin(0.5).setVisible(visible);

    this.powerTrack = this.add.rectangle(x, y, barW, barH, 0x0a1a10, 1)
      .setStrokeStyle(2, COLORS.panelBorder)
      .setVisible(visible);

    // sweet zone marker (high power but not max - max can hit post slightly more)
    this.powerSweet = this.add.rectangle(x + barW * 0.18, y, barW * 0.28, barH - 4, 0x2f9e5d, 0.35)
      .setVisible(visible);

    this.powerFill = this.add.rectangle(x - barW / 2, y, 4, barH - 4, COLORS.gold, 1)
      .setOrigin(0, 0.5)
      .setVisible(visible);

    this.powerNeedle = this.add.rectangle(x - barW / 2, y, 4, barH + 8, COLORS.cream, 1)
      .setVisible(visible);

    this.powerBarW = barW;
    this.powerBarX = x - barW / 2;
    this.powerUi = [this.powerLabel, this.powerTrack, this.powerSweet, this.powerFill, this.powerNeedle];
  }

  setPowerUiVisible(visible) {
    this.powerUi.forEach((o) => o.setVisible(visible));
  }

  startAimSweep() {
    const pad = 28;
    const minX = this.goalLeft + pad;
    const maxX = this.goalRight - pad;
    const minY = this.goalTop + 10;
    const maxY = this.goalBottom - 10;

    this.crosshair.setPosition(
      Phaser.Math.Between(minX, maxX),
      Phaser.Math.Between(minY, maxY),
    );

    this.aimTweenX = this.tweens.add({
      targets: this.crosshair,
      x: maxX,
      duration: 1100,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Start going left if we're closer to right
    if (this.crosshair.x > this.goalX) {
      this.aimTweenX.stop();
      this.aimTweenX = this.tweens.add({
        targets: this.crosshair,
        x: minX,
        duration: 1100,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }

    this.aimTweenY = this.tweens.add({
      targets: this.crosshair,
      y: minY,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  startPowerSweep() {
    this.setPowerUiVisible(true);
    this.powerNeedle.x = this.powerBarX;
    this.powerFill.width = 4;

    this.powerTween = this.tweens.add({
      targets: this.powerNeedle,
      x: this.powerBarX + this.powerBarW,
      duration: 850,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        const t = Phaser.Math.Clamp(
          (this.powerNeedle.x - this.powerBarX) / this.powerBarW,
          0,
          1,
        );
        this.power = t;
        this.powerFill.width = Math.max(4, t * this.powerBarW);
        // color feedback
        if (t > 0.82) this.powerFill.setFillStyle(COLORS.red, 1);
        else if (t > 0.55) this.powerFill.setFillStyle(0x7dffa8, 1);
        else this.powerFill.setFillStyle(COLORS.gold, 1);
      },
    });
  }

  onAction() {
    if (this.phase === 'aim') {
      this.lockAim();
    } else if (this.phase === 'power') {
      this.lockPowerAndShoot();
    }
  }

  lockAim() {
    this.phase = 'power';
    sfx.click();

    if (this.aimTweenX) this.aimTweenX.stop();
    if (this.aimTweenY) this.aimTweenY.stop();

    this.lockedAim = { x: this.crosshair.x, y: this.crosshair.y };

    // freeze marker
    this.tweens.add({
      targets: this.crosshair,
      scale: 1.2,
      duration: 120,
      yoyo: true,
    });

    this.subtitle.setText('2/2 · Potencia: click o ESPACIO en la zona verde (muy arriba puede pegar en el palo)');
    this.hint.setText('¡Elegí la potencia!');
    this.actionBtn.text.setText('PEGARLE');

    this.startPowerSweep();
  }

  lockPowerAndShoot() {
    if (this.phase !== 'power') return;
    this.phase = 'shot';

    if (this.powerTween) this.powerTween.stop();
    this.actionBtn.setEnabled(false);
    sfx.kick();

    const target = this.lockedAim;
    const power = this.power;

    // Normalized aim: -1 left … 1 right, 0 low … 1 high
    const nx = Phaser.Math.Clamp(
      ((target.x - this.goalX) / (this.goalWidth / 2 - 20)),
      -1,
      1,
    );
    const ny = Phaser.Math.Clamp(
      1 - ((target.y - this.goalTop) / (this.goalBottom - this.goalTop)),
      0,
      1,
    );

    const corner = Math.abs(nx);
    const result = this.resolveShot({ nx, ny, corner, power, target });

    this.hint.setText(result.hint);
    this.playShotAnimation(target, power, result);
  }

  /**
   * Decide gol / atajada / palo según skill + dificultad por racha.
   */
  resolveShot({ nx, ny, corner, power, target }) {
    const diff = gameState.keeperDifficulty(); // 0..1

    // Too weak: barely arrives, easy save
    if (power < 0.18) {
      return { type: 'save', hint: 'Muy floja… fácil para el arquero', quality: power };
    }

    // Overhit near post: woodwork risk scales with power + frame proximity + difficulty
    const nearPost = corner > 0.88 || ny > 0.9;
    let postChance = nearPost && power > 0.9 ? 0.35 : nearPost && power > 0.82 ? 0.18 : 0;
    postChance += diff * 0.08;
    if (Math.random() < postChance) {
      return { type: 'post', hint: '¡Al palo!', quality: power, target };
    }

    // Harder streak → faster reaction, longer dive, less error, bigger catch
    const reactionMs = Phaser.Math.Linear(320, 90, power) * Phaser.Math.Linear(1, 0.62, diff);
    const maxDive = Phaser.Math.Linear(95, 150, 1 - corner * 0.35) * Phaser.Math.Linear(1, 1.28, diff);
    const diveError = Phaser.Math.Between(-28, 28) * (1.1 - power * 0.5) * Phaser.Math.Linear(1, 0.45, diff);

    const desiredX = target.x + diveError;
    const reachX = Phaser.Math.Clamp(
      desiredX,
      this.keeperHomeX - maxDive,
      this.keeperHomeX + maxDive,
    );

    const baseCatch = Phaser.Math.Linear(78, 36, power) * Phaser.Math.Linear(1, 1.35, diff);
    const catchRadius = baseCatch * (1.15 - corner * 0.45) * (1.1 - ny * 0.25);

    const dist = Math.hypot(reachX - target.x, (this.goalY + 70) - target.y);
    const saved = dist < catchRadius;

    const clutchFail = power > 0.7 && corner > 0.7 && Math.random() < (0.06 + diff * 0.08);

    if (saved || clutchFail) {
      return {
        type: 'save',
        hint: corner < 0.35 ? 'Al medio… ¡atajada!' : '¡Gran estirada del arquero!',
        quality: power,
        keeperX: reachX,
        reactionMs,
      };
    }

    return {
      type: 'goal',
      hint: corner > 0.7 ? '¡Al ángulo!' : '¡Adentro!',
      quality: power,
      keeperX: reachX,
      reactionMs,
    };
  }

  playShotAnimation(target, power, result) {
    if (this.keeperIdle) this.keeperIdle.stop();

    const flightMs = Phaser.Math.Linear(720, 320, power);
    const keeperDelay = result.reactionMs ?? Phaser.Math.Linear(300, 100, power);
    const keeperX = result.keeperX ?? this.goalX + Math.sign(target.x - this.goalX) * 80;

    this.time.delayedCall(keeperDelay, () => {
      this.tweens.add({
        targets: this.keeper,
        x: keeperX,
        angle: keeperX < this.goalX ? -50 : keeperX > this.goalX ? 50 : 0,
        duration: Math.max(160, flightMs - keeperDelay + 40),
        ease: 'Cubic.easeOut',
      });
    });

    let endX = target.x;
    let endY = target.y;

    if (result.type === 'post') {
      // deflect off post
      endX = target.x > this.goalX ? this.goalRight - 6 : this.goalLeft + 6;
      endY = Math.min(target.y, this.goalY + 30);
    }

    this.tweens.add({
      targets: this.ball,
      x: endX,
      y: endY,
      scale: 0.42,
      angle: 420 * (0.5 + power),
      duration: flightMs,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        if (result.type === 'goal') {
          this.onGoal(result);
        } else if (result.type === 'post') {
          this.onPost(result);
        } else {
          this.tweens.add({
            targets: this.ball,
            x: keeperX + 6,
            y: this.keeper.y - 8,
            scale: 0.32,
            duration: 110,
            onComplete: () => this.onSave(result),
          });
        }
      },
    });
  }

  onGoal(result) {
    sfx.goal();
    this.cameras.main.flash(280, 120, 220, 140);
    spawnConfetti(this, { count: 42, y: this.goalY + 40, spread: 160 });
    this.hint.setColor('#7dffa8');
    this.hint.setText(`¡GOOOL! ${result.hint}`);

    this.tweens.add({
      targets: this.ball,
      scale: 0.38,
      y: this.ball.y + 10,
      duration: 160,
      yoyo: true,
    });

    if (result.quality > 0.65) {
      gameState.score += 25;
    }

    gameState.penaltyScored();
    this.finishAfter(1300);
  }

  onSave(result) {
    sfx.save();
    this.cameras.main.shake(220, 0.012);
    this.hint.setColor('#ffb4a8');
    this.hint.setText(result.hint || '¡Atajó! Perdés una vida');

    gameState.penaltyMissed();
    this.finishAfter(1300);
  }

  onPost(result) {
    sfx.save();
    this.cameras.main.shake(180, 0.01);
    this.hint.setColor('#ffd27a');
    this.hint.setText('¡Al palo! No entra… −1 vida');

    // rebound out
    this.tweens.add({
      targets: this.ball,
      x: this.goalX + (this.ball.x > this.goalX ? 80 : -80),
      y: this.ball.y + 90,
      scale: 0.5,
      duration: 280,
      ease: 'Quad.easeOut',
    });

    gameState.penaltyMissed();
    this.finishAfter(1400);
  }

  finishAfter(ms) {
    this.time.delayedCall(ms, () => {
      if (gameState.isGameOver() || !gameState.hasMoreQuestions()) {
        this.scene.start('GameOverScene', {
          cleared: !gameState.isGameOver() && !gameState.hasMoreQuestions(),
        });
      } else {
        this.scene.start('QuizScene');
      }
    });
  }

  drawStadium() {
    const { width, height } = this.scale;
    const g = this.add.graphics();
    g.fillStyle(0x0a1620, 1);
    g.fillRect(0, 0, width, height);

    for (let x = 0; x < width; x += 64) {
      this.add.image(x + 32, 95, 'crowd').setAlpha(0.7);
    }

    g.fillStyle(COLORS.pitch, 1);
    g.fillRect(0, height * 0.3, width, height * 0.7);

    for (let y = height * 0.3; y < height; y += 40) {
      g.fillStyle(COLORS.pitchLight, 0.22);
      g.fillRect(0, y, width, 20);
    }

    g.lineStyle(2, COLORS.cream, 0.55);
    g.strokeRect(width / 2 - 230, height - 270, 460, 190);
    g.strokeCircle(width / 2, height - 150, 10);
  }

  drawGoal() {
    const g = this.add.graphics();
    const x = this.goalLeft;
    const y = this.goalY;

    g.fillStyle(0xffffff, 0.07);
    g.fillRect(x, y, this.goalWidth, this.goalHeight);

    g.lineStyle(2, 0xffffff, 0.18);
    for (let i = 0; i <= 12; i += 1) {
      g.lineBetween(x + (i * this.goalWidth) / 12, y, x + (i * this.goalWidth) / 12, y + this.goalHeight);
    }
    for (let j = 0; j <= 6; j += 1) {
      g.lineBetween(x, y + (j * this.goalHeight) / 6, x + this.goalWidth, y + (j * this.goalHeight) / 6);
    }

    g.lineStyle(9, COLORS.white, 1);
    g.lineBetween(x, y + this.goalHeight, x, y);
    g.lineBetween(x, y, x + this.goalWidth, y);
    g.lineBetween(x + this.goalWidth, y, x + this.goalWidth, y + this.goalHeight);

    g.lineStyle(3, COLORS.cream, 0.75);
    g.lineBetween(x - 24, y + this.goalHeight, x + this.goalWidth + 24, y + this.goalHeight);
  }

  shutdown() {
    this.input.keyboard?.off('keydown-SPACE', this.onAction, this);
  }
}
