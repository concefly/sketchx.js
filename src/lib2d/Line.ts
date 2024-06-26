import { Matrix3, Vec2, Vector2 } from 'three';
import { Curve } from './Curve';
import { ICurveLineData } from './2d.type';
import { TMP_VEC2 } from './TmpVec';
import { IntersectAlgo } from './Algo/IntersectAlgo';
import { VecUtil } from '../VecUtil';

export class Line extends Curve {
  constructor(
    public p0: Vec2,
    public p1: Vec2
  ) {
    super();
  }

  get geoCenter() {
    return VecUtil.center([this.p0, this.p1], { x: 0, y: 0 });
  }

  get length() {
    return VecUtil.distanceTo(this.p0, this.p1);
  }

  nearestPoint(pnt: Vec2): number {
    const p0 = this.p0;
    const p1 = this.p1;
    const v = new Vector2().copy(p1).sub(p0);
    const w = new Vector2().copy(pnt).sub(p0);

    const t = w.dot(v) / v.dot(v);

    if (t <= 0) return 0;
    if (t >= 1) return this.length;

    return t * this.length;
  }

  isClosed() {
    return this.p0.x === this.p1.x && this.p0.y === this.p1.y;
  }

  pointAt(len: number, ref: Vec2): Vec2 {
    const t = len / this.length;
    return VecUtil.lerp(this.p0, this.p1, t, ref);
  }

  tangentAt(_len: number, ref: Vec2): Vec2 {
    if (VecUtil.equals(this.p0, this.p1)) return VecUtil.set(1, 0, ref); // 默认返回 x 轴

    VecUtil.sub(this.p1, this.p0, ref);
    VecUtil.normalize(ref, ref);

    return ref;
  }

  clone() {
    return new Line({ ...this.p0 }, { ...this.p1 });
  }

  applyMatrix(matrix: Matrix3): void {
    VecUtil.applyMatrix3(this.p0, matrix, this.p0);
    VecUtil.applyMatrix3(this.p1, matrix, this.p1);
  }

  toPolyline() {
    if (VecUtil.equals(this.p0, this.p1)) return [{ ...this.p0 }]; // 线段退化为点
    return [{ ...this.p0 }, { ...this.p1 }];
  }

  toJSON(): ICurveLineData {
    return {
      type: 'line',
      p0: [this.p0.x, this.p0.y],
      p1: [this.p1.x, this.p1.y],
    };
  }

  fromJSON(data: ICurveLineData) {
    VecUtil.set(data.p0[0], data.p0[1], this.p0);
    VecUtil.set(data.p1[0], data.p1[1], this.p1);

    return this;
  }

  lengthAt(pnt: Vec2): number | null {
    // 点法式计算距离
    const p0 = this.p0;
    const p1 = this.p1;

    if (VecUtil.equals(p0, p1)) return 0;
    if (VecUtil.equals(p0, pnt)) return this.length;

    const v01 = VecUtil.sub(p1, p0, { x: 0, y: 0 });
    const v0p = VecUtil.sub(pnt, p0, { x: 0, y: 0 });

    // 共线检查
    const cross = VecUtil.cross(v01, v0p);
    if (cross !== 0) return null;

    const xs = [p0.x, pnt.x, p1.x].sort((a, b) => a - b);
    const ys = [p0.y, pnt.y, p1.y].sort((a, b) => a - b);
    if (xs[1] !== pnt.x || ys[1] !== pnt.y) return null;

    return VecUtil.length(v0p);
  }

  vertices(): Vec2[] {
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
    const a = p1.y - p0.y;
    const b = p0.x - p1.x;
    const c = p1.x * p0.y - p0.x * p1.y;
    return { a, b, c };
  }

  /** 沿法向偏移 */
  normalOffset(offset: number) {
    const p0 = this.p0;
    const p1 = this.p1;

    const movement = { x: 0, y: 0 };

    VecUtil.set(p1.x, p1.y, movement);
    VecUtil.sub(movement, p0, movement);
    VecUtil.normalize(movement, movement);
    VecUtil.rotateAround(movement, { x: 0, y: 0 }, Math.PI / 2, movement);

    movement.x *= offset;
    movement.y *= offset;

    this.p0.x += movement.x;
    this.p0.y += movement.y;

    this.p1.x += movement.x;
    this.p1.y += movement.y;

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
  extend(pnt: Vec2): this;
  extend(arg0: any): this {
    if (typeof arg0 === 'number') {
      if (arg0 <= 0) return this; // 不允许负数

      const v = { x: 0, y: 0 };

      VecUtil.sub(this.p1, this.p0, v);
      VecUtil.normalize(v, v);
      v.x *= arg0;
      v.y *= arg0;

      this.p1.x += v.x;
      this.p1.y += v.y;
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

    if (VecUtil.isVec2(arg0)) {
      const p0 = this.p0;
      const p1 = this.p1;
      const pnt = arg0;

      const v0 = VecUtil.sub(pnt, p0, { x: 0, y: 0 });
      const v1 = VecUtil.sub(p1, p0, { x: 0, y: 0 });

      // 点到线段的垂足
      const t = VecUtil.dot(v0, v1) / VecUtil.dot(v1, v1);
      const foot = VecUtil.lerp(p0, p1, t, { x: 0, y: 0 });

      // 垂足在线段上
      if (t >= 0 && t <= 1) return this;

      // 延长线段到垂足
      const d0 = VecUtil.distanceTo(foot, p0);
      const d1 = VecUtil.distanceTo(foot, p1);

      if (d0 < d1) VecUtil.set(foot.x, foot.y, p0);
      else VecUtil.set(foot.x, foot.y, p1);
    }

    return this;
  }
}
