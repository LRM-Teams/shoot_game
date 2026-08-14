/**
 * ResultScene（render 侧）：结算界面，显示到达的波次，回车/点击重开。
 * 无音乐、可直接复玩（验收标准2）。
 */
import Phaser from "phaser";

export class ResultScene extends Phaser.Scene {
  constructor() {
    super("Result");
  }

  create(data: { wave?: number; score?: number }): void {
    const { width, height } = this.scale;
    const wave = data?.wave ?? 0;
    const score = data?.score ?? 0;
    this.add
      .text(
        width / 2,
        height / 2 - 20,
        `游戏结束\n得分：${score}\n到达波次：${wave}\n\n按 回车 / 点击 重新开始`,
        { font: "24px monospace", color: "#ffffff", align: "center" },
      )
      .setOrigin(0.5);

    this.input.keyboard!.once("keydown-ENTER", () => this.scene.start("Game"));
    this.input.once("pointerdown", () => this.scene.start("Game"));
  }
}
