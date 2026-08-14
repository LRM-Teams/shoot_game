# shoot_game

无音乐的网页俯视角射击游戏 MVP，使用 Vite、TypeScript 与 Phaser 3。

## 开始

```bash
npm install
npm run dev
```

运行 `npm run test` 执行纯逻辑测试，运行 `npm run build` 生成生产构建。

## 操作

- 移动：WASD 或方向键
- 瞄准：鼠标
- 射击：按住鼠标左键或空格
- 开始/重开：回车或点击

## 架构

- `logic/`：不依赖 Phaser 的状态、实体、碰撞、生成、计分与命中事件。
- `render/`：Phaser 场景、输入映射、程序绘制、HUD 与粒子反馈。
- `test/`：逻辑层单测。

游戏包含移动、瞄准、连续射击、敌人波次、生命、分数、死亡与重开。每次命中都在碰撞位置触发粒子反馈；不包含音乐或音效。
