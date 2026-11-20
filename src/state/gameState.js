import { shuffleQuestions, QUESTIONS } from '../data/questions.js';

const INITIAL_LIVES = 3;
export const QUESTION_TIME = 12;
export const QUICK_QUESTION_COUNT = 10;

export const MODES = {
  quick: 'quick',
  infinite: 'infinite',
};

export const gameState = {
  mode: MODES.quick,
  score: 0,
  lives: INITIAL_LIVES,
  streak: 0,
  questionIndex: 0,
  questions: [],
  pendingLifeLoss: false,
  penaltyDifficulty: 0,
  bestStreak: 0,
  answeredCount: 0,

  /** Dificultad del arquero 0..1 (en el penal usa la racha al momento del error) */
  keeperDifficulty() {
    if (this.pendingLifeLoss) {
      return this.penaltyDifficulty;
    }
    return Math.min(1, this.streak / 8);
  },

  reset(mode = MODES.quick) {
    this.mode = mode;
    this.score = 0;
    this.lives = INITIAL_LIVES;
    this.streak = 0;
    this.bestStreak = 0;
    this.questionIndex = 0;
    this.pendingLifeLoss = false;
    this.penaltyDifficulty = 0;
    this.answeredCount = 0;

    const pool = shuffleQuestions();
    if (mode === MODES.quick) {
      this.questions = pool.slice(0, Math.min(QUICK_QUESTION_COUNT, pool.length));
    } else {
      this.questions = pool;
    }
  },

  currentQuestion() {
    return this.questions[this.questionIndex] ?? null;
  },

  advanceQuestion() {
    this.answeredCount += 1;
    this.questionIndex += 1;

    if (this.mode === MODES.infinite && this.questionIndex >= this.questions.length) {
      this.questions = shuffleQuestions();
      this.questionIndex = 0;
    }
  },

  answerCorrect(timeLeft = 0) {
    const timeBonus = Math.round(timeLeft * 5);
    this.score += 100 + this.streak * 25 + timeBonus;
    this.streak += 1;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;
    this.advanceQuestion();
  },

  markWrongAnswer() {
    this.penaltyDifficulty = Math.min(1, this.streak / 8);
    this.streak = 0;
    this.pendingLifeLoss = true;
  },

  penaltyScored() {
    this.pendingLifeLoss = false;
    this.penaltyDifficulty = 0;
    this.score += 50;
    this.advanceQuestion();
  },

  penaltyMissed() {
    this.pendingLifeLoss = false;
    this.penaltyDifficulty = 0;
    this.lives -= 1;
    this.advanceQuestion();
  },

  isGameOver() {
    return this.lives <= 0;
  },

  hasMoreQuestions() {
    if (this.mode === MODES.infinite) {
      return this.lives > 0 && QUESTIONS.length > 0;
    }
    return this.questionIndex < this.questions.length;
  },

  progressLabel() {
    if (this.mode === MODES.infinite) {
      return `#${this.answeredCount + 1}`;
    }
    return `${this.questionIndex + 1} / ${this.questions.length}`;
  },

  modeLabel() {
    return this.mode === MODES.quick ? 'Rápida' : 'Infinito';
  },
};
