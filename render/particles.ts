/**
 * 命中/爆炸粒子反馈（render 侧）。
 * 提供轻量粒子爆发，用于命中敌人与玩家受击的清晰视觉反馈（验收标准3）。
 */
import Phaser from "phaser";

interface Particle extends Phaser.GameObjects.Arc {
  vx: number;
  vy: number;
  ttl: number;
  life: number;
}

export class ParticleBurst {
  private debris: Particle[] = [];
  private updateFn: () => void;

  constructor(private scene: Phaser.Scene) {
    this.updateFn = () => this.update();
    this.scene.events.on("update", this.updateFn);
  }

  burst(x: number, y: number, color: number, n = 10, speed = 120, life = 0.5): void {
    for (let i = 0; i < n; i++) {
      const ang = Math.random() * Math.PI * 2;
      const sp = speed * (0.4 + Math.random() * 0.6);
      const arc = this.scene.add.circle(x, y, 2 + Math.random() * 2, color) as Particle;
      arc.setDepth(10);
      arc.vx = Math.cos(ang) * sp;
      arc.vy = Math.sin(ang) * sp;
      arc.life = life;
      arc.ttl = life;
      this.debris.push(arc);
    }
  }

  private update(): void {
    const dt = this.scene.game.loop.delta / 1000;
    for (let i = this.debris.length - 1; i >= 0; i--) {
      const d = this.debris[i];
      d.ttl -= dt;
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      d.vx *= 0.96;
      d.vy *= 0.96;
      d.setAlpha(Math.max(0, d.ttl / d.life));
      if (d.ttl <= 0) {
        d.destroy();
        this.debris.splice(i, 1);
      }
    }
  }

  destroy(): void {
    this.scene.events.off("update", this.updateFn);
    for (const d of this.debris) d.destroy();
    this.debris = [];
  }
}

export const HIT_COLOR = 0xffdd55;
export const ENEMY_COLOR = 0xff5566;
