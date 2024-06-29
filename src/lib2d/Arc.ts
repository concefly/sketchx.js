import { Curve } from './Curve';
import { ICurveArcData } from './2d.type';
import { TMP_VEC2 } from './TmpVec';
import { Vec2Util } from '../Vec2Util';
import { IMat3, IVec2 } from '../typing';

/** 圆弧
 * @param p0 起点
 * @param p1 终点
 * @param bulge 凸度(正值表示逆时针，负值表示顺时针)
 */
export class Arc extends Curve {
  constructor(
    public p0: IVec2,
    public p1: IVec2,
    public bulge: number
  ) {
    super();
  }

  angleAt(len: number): number {
    const { p0, p1 } = this;
    const center = this.getCenter(TMP_VEC2[0]);

    let ag0 = Math.atan2(p0[1] - center[1], p0[0] - center[0]);
    let ag1 = Math.atan2(p1[1] - center[1], p1[0] - center[0]);

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

  getCenter(ref: IVec2): IVec2 {
    const { p0, p1, bulge } = this;

    if (bulge === 0) {
      ref[0] = (p0[0] + p1[0]) / 2;
      ref[1] = (p0[1] + p1[1]) / 2;
    } else {
      const b = 0.5 * (1 / bulge - bulge);
      const x = (p0[0] + p1[0] - b * (p1[1] - p0[1])) * 0.5;
      const y = (p0[1] + p1[1] + b * (p1[0] - p0[0])) * 0.5;
      ref[0] = x;
      ref[1] = y;
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
    if (p0[0] === p1[0] && p0[1] === p1[1]) return 0;

    const distance = Vec2Util.distanceTo(p0, p1);

    return Math.abs(distance / (2 * Math.sin(this.getSita() / 2)));
  }

  nearestPoint(pnt: IVec2): number {
    const center = this.getCenter(TMP_VEC2[0]);
    const radius = this.getRadius();

    const vec = Vec2Util.sub(pnt, center, []);
    const angle = Math.atan2(vec[1], vec[0]);

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

  get geoCenter(): IVec2 {
    return this.getCenter(TMP_VEC2[0]);
  }

  isClosed(): boolean {
    return false;
  }

  pointAt(len: number, ref: IVec2): IVec2 {
    const center = this.getCenter(TMP_VEC2[0]);
    const radius = this.getRadius();

    const angle = this.angleAt(len);

    const x = center[0] + radius * Math.cos(angle);
    const y = center[1] + radius * Math.sin(angle);

    ref[0] = x;
    ref[1] = y;

    return ref;
  }

  tangentAt(len: number, ref: IVec2): IVec2 {
    const angle = this.angleAt(len);
    const x = -Math.sin(angle);
    const y = Math.cos(angle);

    ref[0] = x;
    ref[1] = y;

    return ref;
  }

  clone() {
    return new Arc([...this.p0], [...this.p1], this.bulge);
  }

  applyMatrix(matrix: IMat3): void {
    Vec2Util.applyMatrix(this.p0, matrix, this.p0);
    Vec2Util.applyMatrix(this.p1, matrix, this.p1);
  }

  toJSON(): ICurveArcData {
    return {
      type: 'arc',
      p0: [...this.p0],
      p1: [...this.p1],
      bulge: this.bulge,
    };
  }

  fromJSON(data: ICurveArcData): this {
    Vec2Util.copy(data.p0, this.p0);
    Vec2Util.copy(data.p1, this.p1);

    this.bulge = data.bulge;
    return this;
  }

  toPolyline(subdivision = 0): IVec2[] {
    const sitaDeg = Math.abs((this.getSita() * 180) / Math.PI);

    // 每 1° 一个点
    if (subdivision === 0) subdivision = sitaDeg;

    const len = this.length;
    const points: IVec2[] = [];
    for (let i = 0; i <= subdivision; i++) {
      points.push(this.pointAt((i / subdivision) * len, []));
    }
    return points;
  }

  lengthAt(pnt: IVec2): number | null {
    const center = this.getCenter(TMP_VEC2[0]);
    const radius = this.getRadius();

    if (Math.abs(Vec2Util.distanceTo(pnt, center) - radius) > 1e-6) return null;

    const vec = Vec2Util.sub(pnt, center, []);
    const angle = Math.atan2(vec[1], vec[0]);

    const angle0 = this.angleAt(0);
    const angle1 = this.angleAt(this.length);

    if (angle < angle0) return null;
    if (angle > angle1) return null;

    const len = (angle - angle0) * radius;
    return len;
  }

  vertices(): IVec2[] {
    return [this.p0, this.p1];
  }

  reverse() {
    const { p0, p1 } = this;
    this.p0 = [...p1];
    this.p1 = [...p0];
    this.bulge = -this.bulge;
    return this;
  }
}
