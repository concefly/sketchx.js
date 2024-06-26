import { Matrix3, Vec2, Vector2, Vector3 } from 'three';
import { Curve } from './Curve';
import { TMP_VEC2 } from './TmpVec';
import { ICurveCircleData } from './2d.type';
import { VecUtil } from '../VecUtil';

export class Circle extends Curve {
  constructor(
    public center: Vec2,
    public radius: number
  ) {
    super();
  }

  nearestPoint(pnt: Vec2): number {
    const center = this.center;
    const radius = this.radius;
    const angle = new Vector2().copy(pnt).sub(center).angle();
    const len = angle * radius;
    return len;
  }

  get length() {
    return Math.PI * 2 * this.radius;
  }

  get geoCenter() {
    return this.center;
  }

  isClosed() {
    return true;
  }

  pointAt(len: number, ref: Vec2): Vec2 {
    const t = len / this.length;
    const angle = Math.PI * 2 * t;
    const x = this.center.x + this.radius * Math.cos(angle);
    const y = this.center.y + this.radius * Math.sin(angle);
    ref.x = x;
    ref.y = y;
    return ref;
  }

  tangentAt(len: number, ref: Vec2): Vec2 {
    const t = len / this.length;
    const angle = Math.PI * 2 * t;
    const x = -this.radius * Math.sin(angle);
    const y = this.radius * Math.cos(angle);
    ref.x = x;
    ref.y = y;
    return ref;
  }

  toPolyline(): Vec2[] {
    if (this.radius === 0) return [{ ...this.center }];

    const points: Vec2[] = [];
    const len = this.length;

    for (let i = 0; i <= 360; i++) {
      const p = this.pointAt((i / 360) * len, { x: 0, y: 0 });
      points.push(p);
    }

    return points;
  }

  clone() {
    return new Circle({ ...this.center }, this.radius);
  }

  applyMatrix(matrix: Matrix3): void {
    VecUtil.applyMatrix3(this.center, matrix, this.center);
  }

  toJSON(): ICurveCircleData {
    return {
      type: 'circle',
      center: [this.center.x, this.center.y],
      radius: this.radius,
    };
  }

  fromJSON(data: ICurveCircleData) {
    this.center.x = data.center[0];
    this.center.y = data.center[1];

    this.radius = data.radius;
    return this;
  }

  lengthAt(pnt: Vec2): number {
    const center = this.center;
    const radius = this.radius;
    const angle = new Vector2().copy(pnt).sub(center).angle();
    const len = angle * radius;
    return len;
  }

  vertices(): Vec2[] {
    // 返回 0 度点
    return [this.pointAt(0, { x: 0, y: 0 })];
  }

  reverse() {
    return this;
  }
}
