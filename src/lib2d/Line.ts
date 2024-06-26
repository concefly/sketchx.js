import { Curve } from './Curve';
import { ICurveLineData } from './2d.type';
import { TMP_VEC2 } from './TmpVec';
import { IntersectAlgo } from './Algo/IntersectAlgo';
import { Vec2Util } from '../Vec2Util';
import { IMat3, IVec2 } from '../typing';

export class Line extends Curve {
  constructor(
    public p0: IVec2,
    public p1: IVec2
  ) {
    super();
  }

  get geoCenter() {
    return Vec2Util.center([this.p0, this.p1], []);
  }

  get length() {
    return Vec2Util.distanceTo(this.p0, this.p1);
  }

  nearestPoint(pnt: IVec2): number {
    const p0 = this.p0;
    const p1 = this.p1;

    const v = Vec2Util.sub(p1, p0, []);
    const w = Vec2Util.sub(pnt, p0, []);

    const t = Vec2Util.dot(w, v) / Vec2Util.dot(v, v);

    if (t <= 0) return 0;
    if (t >= 1) return this.length;

    return t * this.length;
  }

  isClosed() {
    return this.p0[0] === this.p1[0] && this.p0[1] === this.p1[1];
  }

  pointAt(len: number, ref: IVec2): IVec2 {
    const t = len / this.length;
    return Vec2Util.lerp(this.p0, this.p1, t, ref);
  }

  tangentAt(_len: number, ref: IVec2): IVec2 {
    if (Vec2Util.equals(this.p0, this.p1)) return Vec2Util.copy([1, 0], ref); // 默认返回 x 轴

    Vec2Util.sub(this.p1, this.p0, ref);
    Vec2Util.normalize(ref, ref);

    return ref;
  }

  clone() {
    return new Line([...this.p0], [...this.p1]);
  }

  applyMatrix(matrix: IMat3): void {
    Vec2Util.applyMatrix(this.p0, matrix, this.p0);
    Vec2Util.applyMatrix(this.p1, matrix, this.p1);
  }

  toPolyline() {
    if (Vec2Util.equals(this.p0, this.p1)) return [[...this.p0]]; // 线段退化为点
    return [[...this.p0], [...this.p1]];
  }

  toJSON(): ICurveLineData {
    return {
      type: 'line',
      p0: [...this.p0],
      p1: [...this.p1],
    };
  }

  fromJSON(data: ICurveLineData) {
    Vec2Util.copy(data.p0, this.p0);
    Vec2Util.copy(data.p1, this.p1);

    return this;
  }

  lengthAt(pnt: IVec2): number | null {
    // 点法式计算距离
    const p0 = this.p0;
    const p1 = this.p1;

    if (Vec2Util.equals(p0, p1)) return 0;
    if (Vec2Util.equals(p0, pnt)) return this.length;

    const v01 = Vec2Util.sub(p1, p0, []);
    const v0p = Vec2Util.sub(pnt, p0, []);

    // 共线检查
    const cross = Vec2Util.cross(v01, v0p);
    if (cross !== 0) return null;

    const xs = [p0[0], pnt[0], p1[0]].sort((a, b) => a - b);
    const ys = [p0[1], pnt[1], p1[1]].sort((a, b) => a - b);
    if (xs[1] !== pnt[0] || ys[1] !== pnt[1]) return null;

    return Vec2Util.length(v0p);
  }

  vertices(): IVec2[] {
    return [this.p0, this.p1];
  }

  reverse() {
    [this.p0, this.p1] = [this.p1, this.p0];
    return this;
  }

  /** 转换为一般式 */
  toEquation(): { a: number; b: number; c: number } {
    const p0 = this.p0;
    const p1 = this.p1;
    const a = p1[1] - p0[1];
    const b = p0[0] - p1[0];
    const c = p1[0] * p0[1] - p0[0] * p1[1];
    return { a, b, c };
  }

  /** 沿法向偏移 */
  normalOffset(offset: number) {
    const p0 = this.p0;
    const p1 = this.p1;

    const movement = [0, 0];

    Vec2Util.copy(p1, movement);
    Vec2Util.sub(movement, p0, movement);
    Vec2Util.normalize(movement, movement);
    Vec2Util.rotateAround(movement, [0, 0], Math.PI / 2, movement);

    movement[0] *= offset;
    movement[1] *= offset;

    this.p0[0] += movement[0];
    this.p0[1] += movement[1];

    this.p1[0] += movement[0];
    this.p1[1] += movement[1];

    return this;
  }

  /** 延长 */
  extend(len: number): this;

  /**
   * 延长到指定曲线
   */
  extend(curve: Curve): this;

  /**
   * 延长到指定点
   * - 做点到线段的垂足，延长线段到垂足，延长方向取决于垂足到 p0 和 p1 的距离
   */
  extend(pnt: IVec2): this;
  extend(arg0: any): this {
    if (typeof arg0 === 'number') {
      if (arg0 <= 0) return this; // 不允许负数

      const v = [0, 0];

      Vec2Util.sub(this.p1, this.p0, v);
      Vec2Util.normalize(v, v);
      v[0] *= arg0;
      v[1] *= arg0;

      this.p1[0] += v[0];
      this.p1[1] += v[1];
    }

    if (arg0 instanceof Curve) {
      // 找最近的交点，延长到交点
      const intersects = IntersectAlgo.equationIntersect(this, arg0);
      if (intersects.length === 0) return this;

      for (const pnt of intersects) {
        if (arg0.lengthAt(pnt) === null) continue; // 不在目标曲线上，跳过
        this.extend(pnt);
      }
    }

    if (Vec2Util.isVec2(arg0)) {
      const p0 = this.p0;
      const p1 = this.p1;
      const pnt = arg0;

      const v0 = Vec2Util.sub(pnt, p0, []);
      const v1 = Vec2Util.sub(p1, p0, []);

      // 点到线段的垂足
      const t = Vec2Util.dot(v0, v1) / Vec2Util.dot(v1, v1);
      const foot = Vec2Util.lerp(p0, p1, t, []);

      // 垂足在线段上
      if (t >= 0 && t <= 1) return this;

      // 延长线段到垂足
      const d0 = Vec2Util.distanceTo(foot, p0);
      const d1 = Vec2Util.distanceTo(foot, p1);

      if (d0 < d1) Vec2Util.copy(foot, p0);
      else Vec2Util.copy(foot, p1);
    }

    return this;
  }
}
