/**
 * MenuScene（render 侧）：开始界面，说明操作方式（验收标准1：10秒学会操作）。
 */
import Phaser from "phaser";

const MENU_TEXT = [
  "TOP-DOWN SHOOTER",
  "(NO MUSIC)",
  "",
  "MOVE: WASD / ARROWS",
  "AIM: MOUSE",
  "FIRE: HOLD LEFT CLICK / SPACE",
  "",
  "PRESS ENTER OR CLICK TO START",
].join("\n");

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
    // 仅供自动化视觉验收直接进入战斗；普通访问仍显示菜单。
    if (new URLSearchParams(window.location.search).get("autostart") === "1") {
      this.scene.start("Game");
      return;
    }

    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2 - 20, MENU_TEXT, {
        font: "20px monospace",
        color: "#ffffff",
        align: "center",
      })
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-ENTER", () => this.scene.start("Game"));
    this.input.once("pointerdown", () => this.scene.start("Game"));
  }
}
