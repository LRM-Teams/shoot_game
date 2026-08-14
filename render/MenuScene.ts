/**
 * MenuScene（render 侧）：开始界面，说明操作方式（验收标准1：10秒学会操作）。
 */
import Phaser from "phaser";

const MENU_TEXT = [
  "俯视角射击（无音乐）",
  "",
  "移动：WASD / 方向键",
  "瞄准：鼠标",
  "开火：按住 鼠标左键 或 空格",
  "",
  "按 回车 / 点击 开始",
].join("\n");

export class MenuScene extends Phaser.Scene {
  constructor() {
    super("Menu");
  }

  create(): void {
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
