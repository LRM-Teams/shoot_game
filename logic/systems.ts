/**
 * 系统层（纯逻辑推进，不依赖 Phaser）。
 * 每个系统是 (state, dt) 的确定性函数，便于单测与坐标断言。
 */

import type { GameState } from "./GameState";
import { clampToRect, circlesOverlap } from "./math";
import { makeBullet, makeEnemy, type Bullet, type Enemy } from "./entities";

/** 处理玩家移动（8 方向，含对角线归一化）与边界约束。 */
export function updatePlayerMovement(state: GameState, dt: number): void {
  const { player, config, input } = state;
  const { moveX, moveY } = input;

  let dx = moveX;
  let dy = moveY;
  const len = Math.hypot(dx, dy);
  if (len > 1) {
    dx /= len;
    dy /= len;
  }

  player.x += dx * player.moveSpeed * dt;
  player.y += dy * player.moveSpeed * dt;

  const { x, y } = clampToRect(
    player.x,
    player.y,
    player.radius,
    {
      x: 0,
      y: 0,
      width: config.world.width,
      height: config.world.height,
    },
  );
  player.x = x;
  player.y = y;
}

/** 更新玩家瞄准角度（朝向 aim 点）。 */
export function updatePlayerAim(state: GameState): void {
  const { player, input } = state;
  player.aimAngle = Math.atan2(input.aimY - player.y, input.aimX - player.x);
}

/** 处理开火：有子弹冷却、按住开火则生成子弹。 */
export function updatePlayerShooting(state: GameState, dt: number, fire: () => Bullet): void {
  const { player, input } = state;
  player.cooldown = Math.max(0, player.cooldown - dt);
  if (input.firing && player.cooldown <= 0) {
    state.bullets.push(fire());
    player.cooldown = player.fireCooldown;
  }
}

/** 默认的开火动作：从玩家位置沿瞄准角发射一发玩家子弹。 */
export function defaultPlayerFire(state: GameState): Bullet {
  const { player } = state;
  return makeBullet({
    faction: "player",
    x: player.x + Math.cos(player.aimAngle) * (player.radius + 2),
    y: player.y + Math.sin(player.aimAngle) * (player.radius + 2),
    angle: player.aimAngle,
    speed: player.bulletSpeed,
    radius: 4,
    damage: player.bulletDamage,
  });
}

/** 推进玩家：移动+瞄准+射击。整合成一步调用，保证顺序一致。 */
export function updatePlayer(state: GameState, dt: number): void {
  if (state.status !== "playing") return;
  updatePlayerMovement(state, dt);
  updatePlayerAim(state);
  updatePlayerShooting(state, dt, () => defaultPlayerFire(state));
}

/** 推进所有子弹（直线飞行）并清理越界/死亡子弹。 */
export function updateBullets(state: GameState, dt: number): void {
  const { config } = state;
  const w = config.world.width;
  const h = config.world.height;
  for (const b of state.bullets) {
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (!b.alive || b.x < -b.radius || b.x > w + b.radius || b.y < -b.radius || b.y > h + b.radius) {
      b.alive = false;
    }
  }
  state.bullets.splice(0, state.bullets.length, ...state.bullets.filter((b) => b.alive));
}

/** 推进所有敌人（向玩家移动）并施加边界约束。 */
export function updateEnemies(state: GameState, dt: number): void {
  const { enemies, player, config } = state;
  const w = config.world.width;
  const h = config.world.height;
  for (const e of enemies) {
    if (!e.alive) continue;
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    e.x += (dx / d) * e.moveSpeed * dt;
    e.y += (dy / d) * e.moveSpeed * dt;
    const clamped = clampToRect(e.x, e.y, e.radius, { x: 0, y: 0, width: w, height: h });
    e.x = clamped.x;
    e.y = clamped.y;
  }
}

/** 处理子弹命中和敌人撞击玩家的碰撞，并产生命中事件与得分。 */
export function resolveCollisions(state: GameState): void {
  // 1) 玩家子弹 vs 敌人
  for (const b of state.bullets) {
    if (!b.alive || b.faction !== "player") continue;
    for (const e of state.enemies) {
      if (!e.alive) continue;
      if (circlesOverlap(b.x, b.y, b.radius, e.x, e.y, e.radius)) {
        const lethal = e.hp - b.damage <= 0;
        e.hp -= b.damage;
        b.alive = false; // 每发子弹命中即消耗
        // 命中反馈事件（世界坐标，在碰撞处）
        state.hitEvents.push({ x: b.x, y: b.y, kind: lethal ? "kill" : "hit" });
        if (e.hp <= 0) {
          e.alive = false;
          state.score += state.config.scorePerKill;
        }
        break;
      }
    }
  }
  state.bullets.splice(0, state.bullets.length, ...state.bullets.filter((b) => b.alive));
  state.enemies.splice(0, state.enemies.length, ...state.enemies.filter((e) => e.alive));

  // 2) 敌人撞击玩家（接触伤害，撞击后敌人消失）
  for (const e of state.enemies) {
    if (!e.alive) continue;
    if (circlesOverlap(e.x, e.y, e.radius, state.player.x, state.player.y, state.player.radius)) {
      state.player.hp -= e.contactDamage;
      e.alive = false;
      if (state.player.hp <= 0) {
        state.player.hp = 0;
        state.status = "gameover";
      }
    }
  }
  state.enemies.splice(0, state.enemies.length, ...state.enemies.filter((e) => e.alive));
}

/** 取出并清空本帧命中事件缓冲（渲染层每次 frame 后调用一次）。 */
export function drainHitEvents(state: GameState) {
  const events = state.hitEvents.slice();
  state.hitEvents.splice(0, state.hitEvents.length);
  return events;
}

/** 单帧推进：移动 → 射击 → 子弹飞 → 敌人 → 碰撞。 */
export function updateGame(state: GameState, dt: number): void {
  if (state.status !== "playing") return;
  state.time += dt;
  updatePlayer(state, dt);
  updateBullets(state, dt);
  updateEnemies(state, dt);
  resolveCollisions(state);
}

/** 生成一个敌人（用于测试与生成系统接入点）。坐标默认在玩家上方随机。 */
export function spawnEnemy(state: GameState, x?: number, y?: number): Enemy {
  const { config } = state;
  const ex = x ?? Math.random() * (config.world.width - 2 * config.enemy.radius) + config.enemy.radius;
  const ey = y ?? config.enemy.radius + Math.random() * (config.world.height * 0.3);
  const e = makeEnemy(config.enemy, ex, ey);
  state.enemies.push(e);
  return e;
}
