/**
 * 渲染器（render 侧）：把逻辑实体绘制成程序化几何图形。
 * 玩家=青色三角，敌人=红/粉圆，子弹=亮色小球。无美术素材依赖。
 */
import Phaser from "phaser";
import type { GameState } from "../logic";

export interface EntityGraphics {
  player: Phaser.GameObjects.Graphics;
  bullets: Phaser.GameObjects.Graphics;
  enemies: Phaser.GameObjects.Graphics;
}

export function createGraphics(scene: Phaser.Scene): EntityGraphics {
  return {
    player: scene.add.graphics(),
    bullets: scene.add.graphics(),
    enemies: scene.add.graphics(),
  };
}

export function drawState(scene: Phaser.Scene, g: EntityGraphics, state: GameState): void {
  g.player.clear();
  g.bullets.clear();
  g.enemies.clear();

  if (state.status !== "gameover") {
    const p = state.player;
    const { x, y } = p;
    const r = p.radius;
    const a = p.aimAngle;
    g.player.fillStyle(0x33ccff, 1);
    g.player.fillTriangle(
      x + Math.cos(a) * r,
      y + Math.sin(a) * r,
      x + Math.cos(a + 2.4) * r,
      y + Math.sin(a + 2.4) * r,
      x + Math.cos(a - 2.4) * r,
      y + Math.sin(a - 2.4) * r,
    );
  }

  for (const e of state.enemies) {
    if (!e.alive) continue;
    g.enemies.fillStyle(0xff5566, 1);
    g.enemies.fillCircle(e.x, e.y, e.radius);
    g.enemies.lineStyle(2, 0xff8899, 1);
    g.enemies.strokeCircle(e.x, e.y, e.radius);
  }

  for (const b of state.bullets) {
    if (!b.alive) continue;
    g.bullets.fillStyle(b.faction === "player" ? 0xaaffdd : 0xffaa33, 1);
    g.bullets.fillCircle(b.x, b.y, b.radius);
  }
}
