/**
 * 入口：把逻辑接到 Phaser 渲染层并启动。无音乐。
 */
import Phaser from "phaser";
import { MenuScene } from "../render/MenuScene";
import { GameScene } from "../render/GameScene";
import { ResultScene } from "../render/ResultScene";

new Phaser.Game({
  type: Phaser.AUTO,
  parent: "game",
  backgroundColor: "#10131a",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 800,
    height: 600,
  },
  physics: {
    default: "arcade",
  },
  scene: [MenuScene, GameScene, ResultScene],
});
