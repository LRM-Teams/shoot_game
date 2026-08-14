/**
 * logic 层公共入口。
 * 渲染层统一从这里 `import { ... } from "../logic"`，
 * 便于稳定引用而不直接深入内部模块。
 */

export { GameState, IDLE_INPUT } from "./GameState";
export type { GameStatus, InputState, HitEvent } from "./GameState";
export {
  updateGame,
  updatePlayer,
  updatePlayerMovement,
  updatePlayerAim,
  updatePlayerShooting,
  updateBullets,
  updateEnemies,
  resolveCollisions,
  spawnEnemy,
  drainHitEvents,
  defaultPlayerFire,
} from "./systems";
export { defaultConfig, DEFAULT_CONFIG } from "./config";
export type { GameConfig, PlayerConfig, EnemyConfig, WorldConfig } from "./config";
export { makePlayer, makeEnemy, makeBullet, resetEntityIds } from "./entities";
export type { Player, Enemy, Bullet, Faction } from "./entities";
export { clamp, dist, clampToRect, circlesOverlap } from "./math";
export type { Rect } from "./math";
