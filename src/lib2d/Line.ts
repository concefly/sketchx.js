import { Matrix3, Vector2 } from 'three';
import { Curve } from './Curve';
import { ICurveLineData } from './2d.type';
import { TMP_VEC2 } from './TmpVec';
import { IntersectAlgo } from './Algo/IntersectAlgo';

export class Line extends Curve {
  constructor(
    public p0: Vector2,
    public p1: Vector2
  ) {
    super();
  }

  get geoCenter() {
    return this.p0.clone().add(this.p1).multiplyScalar(0.5);
  }

  get length() {
    return this.p0.distanceTo(this.p1);
  }

  nearestPoint(pnt: Vector2): number {
    const p0 = this.p0;
    const p1 = this.p1;
    const v = p1.clone().sub(p0);
    const w = pnt.clone().sub(p0);

    const t = w.dot(v) / v.dot(v);

    if (t <= 0) return 0;
    if (t >= 1) return this.length;

    return t * this.length;
  }

  isClosed() {
    return this.p0.equals(this.p1);
  }

  pointAt(len: number, ref: Vector2): Vector2 {
    const t = len / this.length;
    return ref.copy(this.p0).lerp(this.p1, t);
  }

  tangentAt(_len: number, ref: Vector2): Vector2 {
    if (this.p0.equals(this.p1)) return ref.set(1, 0); // 默认返回 x 轴
    return ref.copy(this.p1).sub(this.p0).normalize();
  }

  clone() {
    return new Line(this.p0.clone(), this.p1.clone());
  }

  applyMatrix(matrix: Matrix3): void {
    this.p0.applyMatrix3(matrix);
    this.p1.applyMatrix3(matrix);
  }

  toPolyline() {
    if (this.p0.equals(this.p1)) return [this.p0.clone()]; // 线段退化为点
    return [this.p0.clone(), this.p1.clone()];
  }

  toJSON(): ICurveLineData {
    return {
      type: 'line',
      p0: [this.p0.x, this.p0.y],
      p1: [this.p1.x, this.p1.y],
    };
  }

  fromJSON(data: ICurveLineData) {
    this.p0.set(data.p0[0], data.p0[1]);
    this.p1.set(data.p1[0], data.p1[1]);
    return this;
  }

  lengthAt(pnt: Vector2): number | null {
    // 点法式计算距离
    const p0 = this.p0;
    const p1 = this.p1;

    if (pnt.equals(p0)) return 0;
    if (pnt.equals(p1)) return this.length;

    const v01 = p1.clone().sub(p0);
    const v0p = pnt.clone().sub(p0);

    // 共线检查
    const cross = v01.cross(v0p);
    if (cross !== 0) return null;

    const xs = [p0.x, pnt.x, p1.x].sort((a, b) => a - b);
    const ys = [p0.y, pnt.y, p1.y].sort((a, b) => a - b);
    if (xs[1] !== pnt.x || ys[1] !== pnt.y) return null;

    return v0p.length();
  }

  vertices(): Vector2[] {
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
    const n = TMP_VEC2[0]
      .copy(p1)
      .sub(p0)
      .normalize()
      .rotateAround(new Vector2(), Math.PI / 2);

    const movement = n.multiplyScalar(offset);

    this.p0.add(movement);
    this.p1.add(movement);

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
  extend(pnt: Vector2): this;
  extend(arg0: any): this {
    if (typeof arg0 === 'number') {
      if (arg0 <= 0) return this; // 不允许负数

      const p0 = this.p0;
      const p1 = this.p1;
      const v = TMP_VEC2[0].copy(p1).sub(p0).normalize().multiplyScalar(arg0);
      this.p1.add(v);
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

    if (arg0 instanceof Vector2) {
      const p0 = this.p0;
      const p1 = this.p1;
      const pnt = arg0;

      const v0 = pnt.clone().sub(p0);
      const v1 = p1.clone().sub(p0);

      // 点到线段的垂足
      const t = v0.dot(v1) / v1.dot(v1);
      const foot = p0.clone().lerp(p1, t);

      // 垂足在线段上
      if (t >= 0 && t <= 1) return this;

      // 延长线段到垂足
      const d0 = foot.distanceTo(p0);
      const d1 = foot.distanceTo(p1);

      if (d0 < d1) p0.copy(foot);
      else p1.copy(foot);
    }

    return this;
  }
}
