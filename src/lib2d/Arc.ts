import { Matrix3, Vector2, Vec2 } from 'three';
import { Curve } from './Curve';
import { ICurveArcData } from './2d.type';
import { TMP_VEC2 } from './TmpVec';
import { VecUtil } from '../VecUtil';

/** 圆弧
 * @param p0 起点
 * @param p1 终点
 * @param bulge 凸度(正值表示逆时针，负值表示顺时针)
 */
export class Arc extends Curve {
  constructor(
    public p0: Vec2,
    public p1: Vec2,
    public bulge: number
  ) {
    super();
  }

  angleAt(len: number): number {
    const { p0, p1 } = this;
    const center = this.getCenter(TMP_VEC2[0]);

    let ag0 = Math.atan2(p0.y - center.y, p0.x - center.x);
    let ag1 = Math.atan2(p1.y - center.y, p1.x - center.x);

    if (ag0 >= Math.PI * 2) ag0 -= Math.PI * 2;
    if (ag1 >= Math.PI * 2) ag1 -= Math.PI * 2;

    const clockwise = this.clockWise;
    if (!clockwise) {
      if (ag1 < ag0) ag1 += Math.PI * 2;
    } else {
      if (ag1 > ag0) ag1 -= Math.PI * 2;
    }

    const t = len / this.length;
    const angle = ag0 + (ag1 - ag0) * t;
    return angle;
  }

  getCenter(ref: Vec2): Vec2 {
    const { p0, p1, bulge } = this;

    if (bulge === 0) {
      const r = new Vector2().copy(p0).add(p1).multiplyScalar(0.5);
      ref.x = r.x;
      ref.y = r.y;
    } else {
      const b = 0.5 * (1 / bulge - bulge);
      const x = (p0.x + p1.x - b * (p1.y - p0.y)) * 0.5;
      const y = (p0.y + p1.y + b * (p1.x - p0.x)) * 0.5;
      ref.x = x;
      ref.y = y;
    }

    return ref;
  }

  /** 圆心角
   * @returns 弧度，正值表示逆时针，负值表示顺时针
   */
  getSita(): number {
    return Math.atan(this.bulge) * 4;
  }

  getRadius(): number {
    const { p0, p1, bulge } = this;
    if (p0.x === p1.x && p0.y === p1.y) return 0;

    const distance = new Vector2().copy(p0).distanceTo(p1);

    return Math.abs(distance / (2 * Math.sin(this.getSita() / 2)));
  }

  nearestPoint(pnt: Vec2): number {
    const center = this.getCenter(TMP_VEC2[0]);
    const radius = this.getRadius();
    const angle = new Vector2().copy(pnt).sub(center).angle();

    const angle0 = this.angleAt(0);
    const angle1 = this.angleAt(this.length);

    if (angle < angle0) return 0;
    if (angle > angle1) return this.length;

    const len = (angle - angle0) * radius;
    return len;
  }

  get clockWise(): boolean {
    return this.bulge < 0;
  }

  get length(): number {
    return Math.abs(this.getSita()) * this.getRadius();
  }

  get geoCenter(): Vec2 {
    return this.getCenter(TMP_VEC2[0]);
  }

  isClosed(): boolean {
    return false;
  }

  pointAt(len: number, ref: Vec2): Vec2 {
    const center = this.getCenter(TMP_VEC2[0]);
    const radius = this.getRadius();

    const angle = this.angleAt(len);

    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);

    ref.x = x;
    ref.y = y;

    return ref;
  }

  tangentAt(len: number, ref: Vec2): Vec2 {
    const angle = this.angleAt(len);
    const x = -Math.sin(angle);
    const y = Math.cos(angle);

    ref.x = x;
    ref.y = y;

    return ref;
  }

  clone() {
    return new Arc({ ...this.p0 }, { ...this.p1 }, this.bulge);
  }

  applyMatrix(matrix: Matrix3): void {
    const p0t = new Vector2().copy(this.p0).applyMatrix3(matrix);
    const p1t = new Vector2().copy(this.p1).applyMatrix3(matrix);

    this.p0.x = p0t.x;
    this.p0.y = p0t.y;

    this.p1.x = p1t.x;
    this.p1.y = p1t.y;
  }

  toJSON(): ICurveArcData {
    return {
      type: 'arc',
      p0: [this.p0.x, this.p0.y],
      p1: [this.p1.x, this.p1.y],
      bulge: this.bulge,
    };
  }

  fromJSON(data: ICurveArcData): this {
    this.p0.x = data.p0[0];
    this.p0.y = data.p0[1];

    this.p1.x = data.p1[0];
    this.p1.y = data.p1[1];

    this.bulge = data.bulge;
    return this;
  }

  toPolyline(subdivision = 0): Vec2[] {
    const sitaDeg = Math.abs((this.getSita() * 180) / Math.PI);

    // 每 1° 一个点
    if (subdivision === 0) subdivision = sitaDeg;

    const len = this.length;
    const points: Vec2[] = [];
    for (let i = 0; i <= subdivision; i++) {
      points.push(this.pointAt((i / subdivision) * len, { x: 0, y: 0 }));
    }
    return points;
  }

  lengthAt(pnt: Vec2): number | null {
    const center = this.getCenter(TMP_VEC2[0]);
    const radius = this.getRadius();

    if (Math.abs(VecUtil.distanceTo(pnt, center) - radius) > 1e-6) return null;

    const angle = new Vector2().copy(pnt).sub(center).angle();

    const angle0 = this.angleAt(0);
    const angle1 = this.angleAt(this.length);

    if (angle < angle0) return null;
    if (angle > angle1) return null;

    const len = (angle - angle0) * radius;
    return len;
  }

  vertices(): Vec2[] {
    return [this.p0, this.p1];
  }

  reverse() {
    const { p0, p1 } = this;
    this.p0 = { ...p1 };
    this.p1 = { ...p0 };
    this.bulge = -this.bulge;
    return this;
  }
}
