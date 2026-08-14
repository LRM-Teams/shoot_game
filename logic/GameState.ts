/**
 * 单一游戏状态（纯逻辑，不依赖 Phaser）。
 * 持有玩家/子弹/敌人列表与游戏状态，并提供所有实体的存储。
 * 输入与推进全部由外部（输入层 + systems）写入。
 */

import type { GameConfig } from "./config";
import { defaultConfig } from "./config";
import type { Bullet, Enemy, Player } from "./entities";
import { makePlayer } from "./entities";

export type GameStatus = "playing" | "paused" | "gameover";

/** 命中反馈事件（纯数据，渲染层逐帧消费后清理）。 */
export interface HitEvent {
  x: number;
  y: number;
  /** hit = 非致命命中；kill = 击杀（敌人血量归零）。 */
  kind: "hit" | "kill";
}

export interface InputState {
  /** 8 方向移动向量（-1..1）。 */
  moveX: number;
  moveY: number;
  /** 是否按住开火。 */
  firing: boolean;
  /** 瞄准目标点（鼠标位置，世界坐标）。 */
  aimX: number;
  aimY: number;
}

export const IDLE_INPUT: InputState = { moveX: 0, moveY: 0, firing: false, aimX: 0, aimY: 0 };

export class GameState {
  readonly config: GameConfig;
  player: Player;
  readonly bullets: Bullet[] = [];
  readonly enemies: Enemy[] = [];
  status: GameStatus = "playing";
  time = 0;
  /** 累计击杀得分。 */
  score = 0;
  /** 本帧命中事件缓冲，渲染层消费后调用 clearHitEvents。 */
  readonly hitEvents: HitEvent[] = [];
  input: InputState = { ...IDLE_INPUT };

  constructor(config: GameConfig = defaultConfig()) {
    this.config = config;
    this.player = makePlayer(
      {
        radius: config.player.radius,
        moveSpeed: config.player.moveSpeed,
        fireCooldown: config.player.fireCooldown,
        bulletSpeed: config.player.bulletSpeed,
        bulletDamage: config.player.bulletDamage,
        maxHp: config.player.maxHp,
      },
      config.world.width / 2,
      config.world.height - 60,
    );
  }
}
