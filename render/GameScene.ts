/**
 * GameScene（render 侧）：拥有一个 GameState，驱动逻辑推进并渲染。
 * 逻辑接口来自 `../logic`（稳定入口；tess 的正式逻辑合入后自动对齐）。
 * 本场景：绑定输入 → updateGame → 消费碰撞事件爆粒子 → 重绘 → HUD。
 */
import Phaser from "phaser";
import { drainHitEvents, GameState, spawnEnemy, updateGame } from "../logic";
import { InputBridge } from "./input";
import { createGraphics, drawState, type EntityGraphics } from "./renderer";
import { ParticleBurst, HIT_COLOR, ENEMY_COLOR } from "./particles";

export class GameScene extends Phaser.Scene {
  private state!: GameState;
  private inputBridge!: InputBridge;
  private g!: EntityGraphics;
  private particles!: ParticleBurst;
  private wave = 0;
  private toSpawn = 0;
  private spawnTimer = 0;
  private hudText?: Phaser.GameObjects.Text;

  constructor() {
    super("Game");
  }

  create(): void {
    this.state = new GameState();
    this.inputBridge = new InputBridge(this);
    this.g = createGraphics(this);
    this.particles = new ParticleBurst(this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.particles.destroy());
    this.wave = 0;
    this.startNextWave();
  }

  shutdown(): void {
    // 清理粒子更新监听，避免多次重开后累积
    this.particles?.destroy();
  }

  private startNextWave(): void {
    this.wave += 1;
    this.toSpawn = 3 + this.wave;
    // 新波次先立即出现一名敌人，开局就给玩家明确的战斗目标。
    this.spawnTimer = 0;
  }

  update(_time: number, delta: number): void {
    this.inputBridge.read(this.state.input, this.cameras.main);

    const dt = Math.min(delta / 1000, 0.05);
    updateGame(this.state, dt);

    // 消费逻辑层碰撞事件：每次命中都在命中位置爆粒子（满足“每次命中”验收）
    for (const ev of drainHitEvents(this.state)) {
      if (ev.kind === "hit") {
        this.particles.burst(ev.x, ev.y, HIT_COLOR, 10);
      } else if (ev.kind === "kill") {
        this.particles.burst(ev.x, ev.y, ENEMY_COLOR, 14);
      }
    }

    // 波次生成（仅游玩中）
    if (this.state.status === "playing") {
      this.spawnTimer -= dt;
      if (this.toSpawn > 0 && this.spawnTimer <= 0) {
        spawnEnemy(this.state);
        this.toSpawn -= 1;
        this.spawnTimer = 0.5 + Math.random() * 0.6;
      }
      if (this.toSpawn <= 0 && this.state.enemies.length === 0) {
        this.startNextWave();
      }
    }

    drawState(this, this.g, this.state);

    // HUD：生命 / 分数 / 波次
    if (!this.hudText) {
      this.hudText = this.add
        .text(12, 12, "", { font: "16px monospace", color: "#ffffff" })
        .setDepth(20)
        .setScrollFactor(0);
    }
    const hp = Math.max(0, this.state.player.hp);
    this.hudText.setText(`HP ${hp}   SCORE ${this.state.score}   WAVE ${this.wave}`);

    // 结算
    if (this.state.status === "gameover") {
      this.scene.start("Result", { wave: this.wave, score: this.state.score });
    }
  }
}
