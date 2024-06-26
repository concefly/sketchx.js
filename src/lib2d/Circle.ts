import { Matrix3, Vector2 } from 'three';
import { Curve } from './Curve';
import { TMP_VEC2 } from './TmpVec';
import { ICurveCircleData } from './2d.type';

export class Circle extends Curve {
  constructor(
    public center: Vector2,
    public radius: number
  ) {
    super();
  }

  nearestPoint(pnt: Vector2): number {
    const center = this.center;
    const radius = this.radius;
    const angle = pnt.clone().sub(center).angle();
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

  pointAt(len: number, ref: Vector2): Vector2 {
    const t = len / this.length;
    const angle = Math.PI * 2 * t;
    const x = this.center.x + this.radius * Math.cos(angle);
    const y = this.center.y + this.radius * Math.sin(angle);
    return ref.set(x, y);
  }

  tangentAt(len: number, ref: Vector2): Vector2 {
    const t = len / this.length;
    const angle = Math.PI * 2 * t;
    const x = -this.radius * Math.sin(angle);
    const y = this.radius * Math.cos(angle);
    return ref.set(x, y);
  }

  toPolyline(): Vector2[] {
    if (this.radius === 0) return [this.center.clone()];

    const points: Vector2[] = [];
    const len = this.length;

    for (let i = 0; i <= 360; i++) {
      const p = this.pointAt((i / 360) * len, new Vector2());
      points.push(p);
    }

    return points;
  }

  clone() {
    return new Circle(this.center.clone(), this.radius);
  }

  applyMatrix(matrix: Matrix3): void {
    this.center.applyMatrix3(matrix);
  }

  toJSON(): ICurveCircleData {
    return {
      type: 'circle',
      center: [this.center.x, this.center.y],
      radius: this.radius,
    };
  }

  fromJSON(data: ICurveCircleData) {
    this.center.set(data.center[0], data.center[1]);
    this.radius = data.radius;
    return this;
  }

  lengthAt(pnt: Vector2): number {
    const center = this.center;
    const radius = this.radius;
    const angle = pnt.clone().sub(center).angle();
    const len = angle * radius;
    return len;
  }

  vertices(): Vector2[] {
    // 返回 0 度点
    return [this.pointAt(0, new Vector2())];
  }

  reverse() {
    return this;
  }
}
