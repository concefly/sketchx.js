import { Matrix3, Vector2 } from 'three';
import { Curve } from './Curve';
import { ICurveArcData } from './2d.type';
import { TMP_VEC2 } from './TmpVec';

/** 圆弧
 * @param p0 起点
 * @param p1 终点
 * @param bulge 凸度(正值表示逆时针，负值表示顺时针)
 */
export class Arc extends Curve {
  constructor(
    public p0: Vector2,
    public p1: Vector2,
    public bulge: number
  ) {
    super();
  }

  angleAt(len: number): number {
    const { p0, p1 } = this;
    const center = this.getCenter(TMP_VEC2[0]);

    let ag0 = TMP_VEC2[1].subVectors(p0, center).angle();
    let ag1 = TMP_VEC2[2].subVectors(p1, center).angle();

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

  getCenter(ref: Vector2): Vector2 {
    const { p0, p1, bulge } = this;

    if (bulge === 0) return ref.copy(p0).add(p1).multiplyScalar(0.5);

    const b = 0.5 * (1 / bulge - bulge);
    const x = (p0.x + p1.x - b * (p1.y - p0.y)) * 0.5;
    const y = (p0.y + p1.y + b * (p1.x - p0.x)) * 0.5;

    return ref.set(x, y);
  }

  /** 圆心角
   * @returns 弧度，正值表示逆时针，负值表示顺时针
   */
  getSita(): number {
    return Math.atan(this.bulge) * 4;
  }

  getRadius(): number {
    const { p0, p1, bulge } = this;
    if (p0.equals(p1)) return 0;

    return Math.abs(p0.distanceTo(p1) / (2 * Math.sin(this.getSita() / 2)));
  }

  nearestPoint(pnt: Vector2): number {
    const center = this.getCenter(TMP_VEC2[0]);
    const radius = this.getRadius();
    const angle = pnt.clone().sub(center).angle();

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

  get geoCenter(): Vector2 {
    return this.getCenter(TMP_VEC2[0]);
  }

  isClosed(): boolean {
    return false;
  }

  pointAt(len: number, ref: Vector2): Vector2 {
    const center = this.getCenter(TMP_VEC2[0]);
    const radius = this.getRadius();

    const angle = this.angleAt(len);

    const x = center.x + radius * Math.cos(angle);
    const y = center.y + radius * Math.sin(angle);

    return ref.set(x, y);
  }

  tangentAt(len: number, ref: Vector2): Vector2 {
    const angle = this.angleAt(len);
    const x = -Math.sin(angle);
    const y = Math.cos(angle);

    return ref.set(x, y);
  }

  clone() {
    return new Arc(this.p0.clone(), this.p1.clone(), this.bulge);
  }

  applyMatrix(matrix: Matrix3): void {
    this.p0.applyMatrix3(matrix);
    this.p1.applyMatrix3(matrix);
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
    this.p0.set(data.p0[0], data.p0[1]);
    this.p1.set(data.p1[0], data.p1[1]);
    this.bulge = data.bulge;
    return this;
  }

  toPolyline(subdivision = 0): Vector2[] {
    const sitaDeg = Math.abs((this.getSita() * 180) / Math.PI);

    // 每 1° 一个点
    if (subdivision === 0) subdivision = sitaDeg;

    const len = this.length;
    const points: Vector2[] = [];
    for (let i = 0; i <= subdivision; i++) {
      points.push(this.pointAt((i / subdivision) * len, new Vector2()));
    }
    return points;
  }

  lengthAt(pnt: Vector2): number | null {
    const center = this.getCenter(TMP_VEC2[0]);
    const radius = this.getRadius();

    if (Math.abs(pnt.distanceTo(center) - radius) > 1e-6) return null;

    const angle = pnt.clone().sub(center).angle();

    const angle0 = this.angleAt(0);
    const angle1 = this.angleAt(this.length);

    if (angle < angle0) return null;
    if (angle > angle1) return null;

    const len = (angle - angle0) * radius;
    return len;
  }

  vertices(): Vector2[] {
    return [this.p0, this.p1];
  }

  reverse() {
    const { p0, p1 } = this;
    this.p0 = p1.clone();
    this.p1 = p0.clone();
    this.bulge = -this.bulge;
    return this;
  }
}
