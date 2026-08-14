/**
 * 数值配置（纯数据，不依赖 Phaser）。
 * 把难度/手感相关的数值集中在这里，方便调参而不用改逻辑。
 */

export interface WorldConfig {
  /** 逻辑世界宽高（渲染映射到屏幕时可能缩放）。 */
  width: number;
  height: number;
}

export interface PlayerConfig {
  radius: number;
  /** 移动速度（单位/秒）。 */
  moveSpeed: number;
  /** 射击冷却（秒）。 */
  fireCooldown: number;
  /** 子弹速度（单位/秒）。 */
  bulletSpeed: number;
  /** 每发子弹伤害。 */
  bulletDamage: number;
  /** 玩家初始生命。 */
  maxHp: number;
}

export interface EnemyConfig {
  radius: number;
  /** 敌人移动速度（单位/秒）。 */
  moveSpeed: number;
  /** 敌人生命。 */
  hp: number;
  /** 撞击玩家的伤害。 */
  contactDamage: number;
}

export interface GameConfig {
  world: WorldConfig;
  player: PlayerConfig;
  enemy: EnemyConfig;
  /** 击杀单个敌人的得分。 */
  scorePerKill: number;
}

export const DEFAULT_CONFIG: GameConfig = {
  world: { width: 800, height: 600 },
  player: {
    radius: 16,
    moveSpeed: 240,
    fireCooldown: 0.18,
    bulletSpeed: 460,
    bulletDamage: 1,
    maxHp: 3,
  },
  enemy: {
    radius: 20,
    moveSpeed: 90,
    hp: 3,
    contactDamage: 1,
  },
  scorePerKill: 10,
};

/** 深拷贝默认配置，避免调用方误改 DEFAULT_CONFIG。 */
export function defaultConfig(): GameConfig {
  return structuredClone(DEFAULT_CONFIG);
}
