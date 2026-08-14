import { describe, it, expect, beforeEach } from "vitest";
import { defaultConfig } from "../logic/config";
import { GameState, IDLE_INPUT } from "../logic/GameState";
import { resetEntityIds } from "../logic/entities";
import {
  updateGame,
  updatePlayer,
  updatePlayerMovement,
  updateBullets,
  updateEnemies,
  resolveCollisions,
  spawnEnemy,
  defaultPlayerFire,
  drainHitEvents,
} from "../logic/systems";
import { clamp, dist, clampToRect, circlesOverlap } from "../logic/math";

beforeEach(() => {
  resetEntityIds();
});

describe("math", () => {
  it("clamp 收拢到边界内", () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });

  it("dist 计算欧氏距离", () => {
    expect(dist(0, 0, 3, 4)).toBeCloseTo(5);
  });

  it("clampToRect 保持圆不越界", () => {
    const r = 10;
    const p = clampToRect(-5, 700, r, { x: 0, y: 0, width: 800, height: 600 });
    expect(p.x).toBe(r);
    expect(p.y).toBe(600 - r);
  });

  it("circlesOverlap 判定相交", () => {
    expect(circlesOverlap(0, 0, 10, 15, 0, 10)).toBe(true); // 距离15<=20
    expect(circlesOverlap(0, 0, 10, 25, 0, 10)).toBe(false); // 距离25>20
  });
});

describe("player movement", () => {
  it("向右移动", () => {
    const s = new GameState(defaultConfig());
    const startX = s.player.x;
    s.input = { ...IDLE_INPUT, moveX: 1 };
    updatePlayerMovement(s, 1);
    expect(s.player.x).toBeGreaterThan(startX);
  });

  it("对角线方向速度归一化（不超速）", () => {
    const s = new GameState(defaultConfig());
    // 放到世界中心，避免贴边影响位移
    s.player.x = s.config.world.width / 2;
    s.player.y = s.config.world.height / 2;
    s.input = { ...IDLE_INPUT, moveX: 1, moveY: -1 }; // 右上
    const x0 = s.player.x;
    const y0 = s.player.y;
    const perAxis = (s.player.moveSpeed * 1) / Math.SQRT2;
    updatePlayerMovement(s, 1);
    // 归一化后每轴位移应为 moveSpeed/sqrt(2)
    expect(s.player.x - x0).toBeCloseTo(perAxis);
    expect(y0 - s.player.y).toBeCloseTo(perAxis);
    // 合位移不超过 moveSpeed
    expect(Math.hypot(s.player.x - x0, s.player.y - y0)).toBeLessThanOrEqual(s.player.moveSpeed);
  });

  it("撞到边界被约束在可见区域", () => {
    const s = new GameState(defaultConfig());
    const { width, height } = s.config.world;
    s.input = { ...IDLE_INPUT, moveX: -1, moveY: -1 };
    const r = s.player.radius;
    updatePlayerMovement(s, 100);
    expect(s.player.x).toBeGreaterThanOrEqual(r);
    expect(s.player.y).toBeGreaterThanOrEqual(r);
    s.input = { ...IDLE_INPUT, moveX: 1, moveY: 1 };
    updatePlayerMovement(s, 100);
    expect(s.player.x).toBeLessThanOrEqual(width - r);
    expect(s.player.y).toBeLessThanOrEqual(height - r);
  });
});

describe("aiming & shooting", () => {
  it("瞄准角度指向目标点", () => {
    const s = new GameState(defaultConfig());
    s.input = { ...IDLE_INPUT, aimX: s.player.x + 100, aimY: s.player.y };
    s.input.firing = false;
    updatePlayer(s, 1 / 60);
    expect(s.player.aimAngle).toBeCloseTo(0, 3);
  });

  it("按住开火按冷却节奏生成子弹", () => {
    const s = new GameState(defaultConfig());
    s.input = { ...IDLE_INPUT, firing: true, aimX: s.player.x + 10, aimY: s.player.y };
    updatePlayer(s, 0);
    expect(s.bullets.length).toBe(1);
    updatePlayer(s, s.player.fireCooldown / 2);
    expect(s.bullets.length).toBe(1);
    updatePlayer(s, s.player.fireCooldown);
    expect(s.bullets.length).toBe(2);
  });

  it("不按开火不生成子弹", () => {
    const s = new GameState(defaultConfig());
    s.input = { ...IDLE_INPUT, firing: false };
    updatePlayer(s, 1 / 60);
    expect(s.bullets.length).toBe(0);
  });

  it("defaultPlayerFire 生成一发玩家阵营子弹", () => {
    const s = new GameState(defaultConfig());
    s.player.aimAngle = 0;
    const b = defaultPlayerFire(s);
    expect(b.faction).toBe("player");
    expect(b.vx).toBeGreaterThan(0);
    expect(b.vy).toBeCloseTo(0);
  });
});

describe("bullets", () => {
  it("子弹直线飞行并推进", () => {
    const s = new GameState(defaultConfig());
    // 先生成一发子弹（按住开火推进一帧生成）
    s.input = { ...IDLE_INPUT, firing: true, aimX: s.player.x + 100, aimY: s.player.y };
    updatePlayer(s, 0);
    expect(s.bullets.length).toBe(1);
    const x0 = s.bullets[0].x;
    updateBullets(s, 0.5);
    expect(s.bullets[0].x).toBeGreaterThan(x0);
  });

  it("越界子弹被清理", () => {
    const s = new GameState(defaultConfig());
    s.bullets.push({
      id: 999, faction: "player", x: 9999, y: 0, vx: 0, vy: 0,
      radius: 4, damage: 1, alive: true,
    });
    updateBullets(s, 0);
    expect(s.bullets.length).toBe(0);
  });
});

describe("enemies", () => {
  it("敌人朝玩家移动", () => {
    const s = new GameState(defaultConfig());
    const e = spawnEnemy(s, s.config.world.width / 2, 20);
    const dy0 = s.player.y - e.y;
    updateEnemies(s, 1);
    expect(dy0).toBeGreaterThan(0);
    expect(s.enemies[0].y - 20).toBeGreaterThan(0);
  });
});

describe("collisions & game over", () => {
  it("玩家子弹命中敌人并扣血/清除，且产生命中事件", () => {
    const s = new GameState(defaultConfig());
    const e = spawnEnemy(s, s.player.x, s.player.y - 100);
    e.hp = 1;
    s.score = 0;
    s.bullets.push({
      id: 1, faction: "player", x: e.x, y: e.y, vx: 0, vy: 0,
      radius: 4, damage: 1, alive: true,
    });
    resolveCollisions(s);
    expect(s.enemies.length).toBe(0);
    expect(s.bullets.length).toBe(0);
    // 击杀产生 kill 事件并加分
    expect(s.hitEvents.length).toBe(1);
    expect(s.hitEvents[0].kind).toBe("kill");
    expect(s.score).toBe(s.config.scorePerKill);
  });

  it("非致命命中产生 hit 事件且不加分", () => {
    const s = new GameState(defaultConfig());
    const e = spawnEnemy(s, s.player.x, s.player.y - 100);
    e.hp = 5; // 高于子弹伤害，命中不死
    s.bullets.push({
      id: 1, faction: "player", x: e.x, y: e.y, vx: 0, vy: 0,
      radius: 4, damage: 1, alive: true,
    });
    resolveCollisions(s);
    expect(e.hp).toBe(4);
    expect(s.enemies.length).toBe(1);
    expect(s.hitEvents[0].kind).toBe("hit");
    expect(s.score).toBe(0);
  });

  it("drainHitEvents 取出并清空命中缓冲", () => {
    const s = new GameState(defaultConfig());
    const e = spawnEnemy(s, s.player.x, s.player.y - 100);
    e.hp = 1;
    s.bullets.push({
      id: 1, faction: "player", x: e.x, y: e.y, vx: 0, vy: 0,
      radius: 4, damage: 1, alive: true,
    });
    resolveCollisions(s);
    expect(s.hitEvents.length).toBe(1);
    const drained = drainHitEvents(s);
    expect(drained.length).toBe(1);
    expect(s.hitEvents.length).toBe(0);
  });

  it("敌人撞击玩家扣血，血量归零进入 gameover", () => {
    const s = new GameState(defaultConfig());
    s.player.hp = s.player.maxHp;
    spawnEnemy(s, s.player.x, s.player.y);
    resolveCollisions(s);
    expect(s.player.hp).toBeLessThan(s.player.maxHp);
    const e2 = spawnEnemy(s, s.player.x, s.player.y);
    e2.contactDamage = s.player.hp;
    resolveCollisions(s);
    expect(s.player.hp).toBe(0);
    expect(s.status).toBe("gameover");
  });

  it("gameover 后 updateGame 不再推进", () => {
    const s = new GameState(defaultConfig());
    s.status = "gameover";
    const t0 = s.time;
    s.input = { ...IDLE_INPUT, moveX: 1 };
    updateGame(s, 1);
    expect(s.time).toBe(t0);
  });
});

describe("spawnEnemy", () => {
  it("生成敌人并加入状态", () => {
    const s = new GameState(defaultConfig());
    const e = spawnEnemy(s, 100, 50);
    expect(s.enemies.length).toBe(1);
    expect(e.x).toBe(100);
    expect(e.y).toBe(50);
  });
});
