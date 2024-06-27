import { IMat3, IVec2 } from './typing';

export const VecUtil = {
  isVec2(pnt: any): pnt is IVec2 {
    return pnt && typeof pnt[0] === 'number' && typeof pnt[1] === 'number';
  },

  copy(src: IVec2, ref: IVec2): IVec2 {
    ref[0] = src[0];
    ref[1] = src[1];
    return ref;
  },

  angle(p0: IVec2, p1: IVec2): number {
    return Math.atan2(p1[1] - p0[1], p1[0] - p0[0]);
  },

  distanceTo(p0: IVec2, p1: IVec2): number {
    return Math.sqrt((p1[0] - p0[0]) ** 2 + (p1[1] - p0[1]) ** 2);
  },

  applyMatrix(pnt: IVec2, mat: IMat3, ref: IVec2): IVec2 {
    const [x, y] = pnt;

    // e 为列优先的矩阵
    const e = mat;

    ref[0] = e[0] * x + e[3] * y + e[6];
    ref[1] = e[1] * x + e[4] * y + e[7];

    return ref;
  },

  center(pnts: IVec2[], ref: IVec2): IVec2 {
    let x = 0;
    let y = 0;

    for (const pnt of pnts) {
      x += pnt[0];
      y += pnt[1];
    }

    ref[0] = x / pnts.length;
    ref[1] = y / pnts.length;

    return ref;
  },

  lerp(p0: IVec2, p1: IVec2, t: number, ref: IVec2): IVec2 {
    ref[0] = p0[0] + (p1[0] - p0[0]) * t;
    ref[1] = p0[1] + (p1[1] - p0[1]) * t;
    return ref;
  },

  equals(p0: IVec2, p1: IVec2): boolean {
    return p0[0] === p1[0] && p0[1] === p1[1];
  },

  sub(p0: IVec2, p1: IVec2, ref: IVec2): IVec2 {
    ref[0] = p0[0] - p1[0];
    ref[1] = p0[1] - p1[1];
    return ref;
  },

  normalize(pnt: IVec2, ref: IVec2): IVec2 {
    const len = Math.sqrt(pnt[0] ** 2 + pnt[1] ** 2);
    ref[0] = pnt[0] / len;
    ref[1] = pnt[1] / len;
    return ref;
  },

  cross(p0: IVec2, p1: IVec2): number {
    return p0[0] * p1[1] - p0[1] * p1[0];
  },

  dot(p0: IVec2, p1: IVec2): number {
    return p0[0] * p1[0] + p0[1] * p1[1];
  },

  length(pnt: IVec2): number {
    return Math.sqrt(pnt[0] ** 2 + pnt[1] ** 2);
  },

  rotateAround(pnt: IVec2, center: IVec2, angle: number, ref: IVec2): IVec2 {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const dx = pnt[0] - center[0];
    const dy = pnt[1] - center[1];
    ref[0] = center[0] + dx * cos - dy * sin;
    ref[1] = center[1] + dx * sin + dy * cos;
    return ref;
  },
};
