import { Vector2, Vec2 } from 'three';
import { Curve } from '../Curve';
import { Line } from '../Line';
import { BaseAlgo } from './BaseAlgo';

/** 曲线求交 */
export class IntersectAlgo extends BaseAlgo {
  static equationIntersect(c0: Curve, c1: Curve): Vec2[] {
    // line - line
    if (c0 instanceof Line && c1 instanceof Line) {
      // 直接通过一般式求交点
      const e0 = c0.toEquation();
      const e1 = c1.toEquation();

      const x = (e0.b * e1.c - e0.c * e1.b) / (e0.a * e1.b - e0.b * e1.a);
      const y = (e0.c * e1.a - e0.a * e1.c) / (e0.a * e1.b - e0.b * e1.a);

      return [{ x, y }];
    }

    return [];
  }

  constructor(
    public c0: Curve,
    public c1: Curve
  ) {
    super();
  }

  run(): [len0: number, len1: number][] {
    const { c0, c1 } = this;

    // line - line
    if (c0 instanceof Line && c1 instanceof Line) {
      // 点法式求交点
      const { p0, p1 } = c1;
      const list: [len0: number, len1: number][] = [];

      const v1 = new Vector2().copy(c0.p1).sub(c0.p0);
      const v2 = new Vector2().copy(p1).sub(p0);
      const v3 = new Vector2().copy(p0).sub(c0.p0);
      const t = v3.cross(v2) / v1.cross(v2);
      const s = v3.cross(v1) / v1.cross(v2);

      if (t >= 0 && t <= 1 && s >= 0 && s <= 1) {
        const len0 = c0.length * t;
        const len1 = c1.length * s;
        list.push([len0, len1]);
      }

      return list;
    }

    console.warn('IntersectAlgo: unknown curve type', c0, c1);
    return [];
  }
}
