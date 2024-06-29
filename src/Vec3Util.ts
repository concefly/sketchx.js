import { IVec3 } from './typing';

export const Vec3Util = {
  isVec3(pnt: any): pnt is IVec3 {
    return pnt && typeof pnt[0] === 'number' && typeof pnt[1] === 'number' && typeof pnt[2] === 'number';
  },

  copy(src: IVec3, ref: IVec3): IVec3 {
    ref[0] = src[0];
    ref[1] = src[1];
    ref[2] = src[2];
    return ref;
  },

  angle(p0: IVec3, p1: IVec3): number {
    return Math.acos(Vec3Util.dot(p0, p1) / (Vec3Util.length(p0) * Vec3Util.length(p1)));
  },

  distanceTo(p0: IVec3, p1: IVec3): number {
    return Vec3Util.length(Vec3Util.sub(p0, p1, []));
  },

  center(pnts: IVec3[], ref: IVec3): IVec3 {
    let x = 0;
    let y = 0;
    let z = 0;

    for (const pnt of pnts) {
      x += pnt[0];
      y += pnt[1];
      z += pnt[2];
    }

    ref[0] = x / pnts.length;
    ref[1] = y / pnts.length;
    ref[2] = z / pnts.length;

    return ref;
  },

  lerp(p0: IVec3, p1: IVec3, t: number, ref: IVec3): IVec3 {
    ref[0] = p0[0] + (p1[0] - p0[0]) * t;
    ref[1] = p0[1] + (p1[1] - p0[1]) * t;
    ref[2] = p0[2] + (p1[2] - p0[2]) * t;
    return ref;
  },

  equals(p0: IVec3, p1: IVec3): boolean {
    return p0[0] === p1[0] && p0[1] === p1[1] && p0[2] === p1[2];
  },

  sub(p0: IVec3, p1: IVec3, ref: IVec3): IVec3 {
    ref[0] = p0[0] - p1[0];
    ref[1] = p0[1] - p1[1];
    ref[2] = p0[2] - p1[2];
    return ref;
  },

  normalize(pnt: IVec3, ref: IVec3): IVec3 {
    const len = Vec3Util.length(pnt);

    ref[0] = pnt[0] / len;
    ref[1] = pnt[1] / len;
    ref[2] = pnt[2] / len;

    return ref;
  },

  cross(p0: IVec3, p1: IVec3, ref: IVec3): IVec3 {
    ref[0] = p0[1] * p1[2] - p0[2] * p1[1];
    ref[1] = p0[2] * p1[0] - p0[0] * p1[2];
    ref[2] = p0[0] * p1[1] - p0[1] * p1[0];
    return ref;
  },

  dot(p0: IVec3, p1: IVec3): number {
    return p0[0] * p1[0] + p0[1] * p1[1] + p0[2] * p1[2];
  },

  length(pnt: IVec3): number {
    return Math.sqrt(pnt[0] ** 2 + pnt[1] ** 2 + pnt[2] ** 2);
  },

  lengthSq(pnt: IVec3): number {
    return pnt[0] ** 2 + pnt[1] ** 2 + pnt[2] ** 2;
  },

  add(p0: IVec3, p1: IVec3, ref: IVec3): IVec3 {
    ref[0] = p0[0] + p1[0];
    ref[1] = p0[1] + p1[1];
    ref[2] = p0[2] + p1[2];
    return ref;
  },

  negate(pnt: IVec3, ref: IVec3): IVec3 {
    ref[0] = -pnt[0];
    ref[1] = -pnt[1];
    ref[2] = -pnt[2];
    return ref;
  },

  multiplyScalar(pnt: IVec3, s: number, ref: IVec3): IVec3 {
    ref[0] = pnt[0] * s;
    ref[1] = pnt[1] * s;
    ref[2] = pnt[2] * s;
    return ref;
  },
};
