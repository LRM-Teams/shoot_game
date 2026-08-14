/**
 * 输入绑定层（render 侧）：把 Phaser 键盘/鼠标输入写入 GameState.input。
 * 只做映射，不改变逻辑。
 */
import Phaser from "phaser";
import type { InputState } from "../logic";

export class InputBridge {
  private keys: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    w: Phaser.Input.Keyboard.Key;
    a: Phaser.Input.Keyboard.Key;
    s: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    fire: Phaser.Input.Keyboard.Key;
  };
  private mouse: Phaser.Input.Pointer;
  private mouseDown = false;

  constructor(private scene: Phaser.Scene) {
    const kb = scene.input.keyboard!;
    this.keys = {
      up: kb.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
      down: kb.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN),
      left: kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
      right: kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
      w: kb.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: kb.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: kb.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: kb.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      fire: kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
    };
    this.mouse = scene.input.activePointer;
    scene.input.on("pointerdown", () => (this.mouseDown = true));
    scene.input.on("pointerup", () => (this.mouseDown = false));
  }

  read(stateInput: InputState, camera: Phaser.Cameras.Scene2D.Camera): void {
    let mx = 0;
    let my = 0;
    if (this.keys.left.isDown || this.keys.a.isDown) mx -= 1;
    if (this.keys.right.isDown || this.keys.d.isDown) mx += 1;
    if (this.keys.up.isDown || this.keys.w.isDown) my -= 1;
    if (this.keys.down.isDown || this.keys.s.isDown) my += 1;

    const cam = camera;
    const wx = cam.scrollX + this.mouse.x / cam.zoom;
    const wy = cam.scrollY + this.mouse.y / cam.zoom;

    stateInput.moveX = mx;
    stateInput.moveY = my;
    stateInput.firing = this.keys.fire.isDown || this.mouseDown;
    stateInput.aimX = wx;
    stateInput.aimY = wy;
  }
}
