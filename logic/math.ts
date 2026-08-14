/**
 * 纯几何/数学辅助函数（可单测）。
 */

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

export function dist(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/** 把位置限制在矩形世界内（半径为 r 时保证整个圆不越界）。 */
export function clampToRect(x: number, y: number, r: number, rect: Rect): { x: number; y: number } {
  return {
    x: clamp(x, rect.x + r, rect.x + rect.width - r),
    y: clamp(y, rect.y + r, rect.y + rect.height - r),
  };
}

/** 两圆相交判定（内联避免二次计算距离）。 */
export function circlesOverlap(
  x1: number, y1: number, r1: number,
  x2: number, y2: number, r2: number,
): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy <= (r1 + r2) * (r1 + r2);
}
