import { Matrix3, Vec2, Vector2, Vector3 } from 'three';

const TMP_VEC2 = [new Vector2(), new Vector2(), new Vector2()];
const TMP_VEC3 = [new Vector3(), new Vector3(), new Vector3()];

export const VecUtil = {
  isVec2(pnt: any): pnt is Vec2 {
    return pnt && typeof pnt.x === 'number' && typeof pnt.y === 'number';
  },

  set(x: number = 0, y: number = 0, ref: Vec2): Vec2 {
    ref.x = x;
    ref.y = y;
    return ref;
  },

  distanceTo(p0: Vec2, p1: Vec2): number {
    return Math.sqrt((p1.x - p0.x) ** 2 + (p1.y - p0.y) ** 2);
  },

  applyMatrix3(pnt: Vec2, mat: Matrix3, ref: Vec2): Vec2 {
    const { x, y } = pnt;
    const e = mat.elements;
    ref.x = e[0] * x + e[3] * y + e[6];
    ref.y = e[1] * x + e[4] * y + e[7];
    return ref;
  },

  center(pnts: Vec2[], ref: Vec2): Vec2 {
    let x = 0;
    let y = 0;

    for (const pnt of pnts) {
      x += pnt.x;
      y += pnt.y;
    }

    ref.x = x / pnts.length;
    ref.y = y / pnts.length;

    return ref;
  },

  lerp(p0: Vec2, p1: Vec2, t: number, ref: Vec2): Vec2 {
    ref.x = p0.x + (p1.x - p0.x) * t;
    ref.y = p0.y + (p1.y - p0.y) * t;
    return ref;
  },

  equals(p0: Vec2, p1: Vec2): boolean {
    return p0.x === p1.x && p0.y === p1.y;
  },

  sub(p0: Vec2, p1: Vec2, ref: Vec2): Vec2 {
    ref.x = p0.x - p1.x;
    ref.y = p0.y - p1.y;
    return ref;
  },

  normalize(pnt: Vec2, ref: Vec2): Vec2 {
    const len = Math.sqrt(pnt.x ** 2 + pnt.y ** 2);
    ref.x = pnt.x / len;
    ref.y = pnt.y / len;
    return ref;
  },

  cross(p0: Vec2, p1: Vec2): number {
    return p0.x * p1.y - p0.y * p1.x;
  },

  dot(p0: Vec2, p1: Vec2): number {
    return p0.x * p1.x + p0.y * p1.y;
  },

  length(pnt: Vec2): number {
    return Math.sqrt(pnt.x ** 2 + pnt.y ** 2);
  },

  rotateAround(pnt: Vec2, center: Vec2, angle: number, ref: Vec2): Vec2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = pnt.x - center.x;
    const dy = pnt.y - center.y;
    ref.x = center.x + dx * cos - dy * sin;
    ref.y = center.y + dx * sin + dy * cos;
    return ref;
  },
};
