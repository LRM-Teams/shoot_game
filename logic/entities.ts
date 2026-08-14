/**
 * 实体定义（纯逻辑：位置、速度、半径、生命、阵营）。
 * 不 import Phaser。渲染层负责把实体映射成可视对象。
 */

export type Faction = "player" | "enemy" | "neutral";

export interface Position {
  x: number;
  y: number;
}

export interface MoveDelta {
  dx: number;
  dy: number;
}

let nextId = 1;

export function resetEntityIds(): void {
  nextId = 1;
}

function allocId(): number {
  return nextId++;
}

export interface Bullet {
  id: number;
  faction: Faction;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  /** 剩余伤害（每发命中一次即耗尽）。 */
  damage: number;
  /** 存活标记，碰撞系统清掉。 */
  alive: boolean;
}

export function makeBullet(opts: {
  faction: Faction;
  x: number;
  y: number;
  angle: number;
  speed: number;
  radius: number;
  damage: number;
}): Bullet {
  return {
    id: allocId(),
    faction: opts.faction,
    x: opts.x,
    y: opts.y,
    vx: Math.cos(opts.angle) * opts.speed,
    vy: Math.sin(opts.angle) * opts.speed,
    radius: opts.radius,
    damage: opts.damage,
    alive: true,
  };
}

export interface Player {
  id: number;
  x: number;
  y: number;
  radius: number;
  moveSpeed: number;
  fireCooldown: number;
  bulletSpeed: number;
  bulletDamage: number;
  maxHp: number;
  hp: number;
  /** 朝目标点瞄准的角度（弧度）。 */
  aimAngle: number;
  /** 当前冷却剩余时间（秒）。 */
  cooldown: number;
}

export function makePlayer(
  cfg: { radius: number; moveSpeed: number; fireCooldown: number; bulletSpeed: number; bulletDamage: number; maxHp: number },
  x: number,
  y: number,
): Player {
  return {
    id: allocId(),
    x,
    y,
    radius: cfg.radius,
    moveSpeed: cfg.moveSpeed,
    fireCooldown: cfg.fireCooldown,
    bulletSpeed: cfg.bulletSpeed,
    bulletDamage: cfg.bulletDamage,
    maxHp: cfg.maxHp,
    hp: cfg.maxHp,
    aimAngle: 0,
    cooldown: 0,
  };
}

export interface Enemy {
  id: number;
  x: number;
  y: number;
  radius: number;
  moveSpeed: number;
  hp: number;
  contactDamage: number;
  alive: boolean;
}

export function makeEnemy(
  cfg: { radius: number; moveSpeed: number; hp: number; contactDamage: number },
  x: number,
  y: number,
): Enemy {
  return {
    id: allocId(),
    x,
    y,
    radius: cfg.radius,
    moveSpeed: cfg.moveSpeed,
    hp: cfg.hp,
    contactDamage: cfg.contactDamage,
    alive: true,
  };
}
