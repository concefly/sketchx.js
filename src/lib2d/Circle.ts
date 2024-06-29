import { Curve } from './Curve';
import { ICurveCircleData } from './2d.type';
import { Vec2Util } from '../Vec2Util';
import { IMat3, IVec2 } from '../typing';

export class Circle extends Curve {
  constructor(
    public center: IVec2,
    public radius: number
  ) {
    super();
  }

  nearestPoint(pnt: IVec2): number {
    const center = this.center;
    const radius = this.radius;
    const vec = Vec2Util.sub(pnt, center, []);
    const angle = Math.atan2(vec[1], vec[0]);
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

  pointAt(len: number, ref: IVec2): IVec2 {
    const t = len / this.length;
    const angle = Math.PI * 2 * t;
    const x = this.center[0] + this.radius * Math.cos(angle);
    const y = this.center[1] + this.radius * Math.sin(angle);
    ref[0] = x;
    ref[1] = y;
    return ref;
  }

  tangentAt(len: number, ref: IVec2): IVec2 {
    const t = len / this.length;
    const angle = Math.PI * 2 * t;
    const x = -this.radius * Math.sin(angle);
    const y = this.radius * Math.cos(angle);
    ref[0] = x;
    ref[1] = y;
    return ref;
  }

  toPolyline(): IVec2[] {
    if (this.radius === 0) return [[...this.center]];

    const points: IVec2[] = [];
    const len = this.length;

    for (let i = 0; i <= 360; i++) {
      const p = this.pointAt((i / 360) * len, []);
      points.push(p);
    }

    return points;
  }

  clone() {
    return new Circle([...this.center], this.radius);
  }

  applyMatrix(matrix: IMat3): void {
    Vec2Util.applyMatrix(this.center, matrix, this.center);
  }

  toJSON(): ICurveCircleData {
    return {
      type: 'circle',
      center: [...this.center],
      radius: this.radius,
    };
  }

  fromJSON(data: ICurveCircleData) {
    Vec2Util.copy(data.center, this.center);

    this.radius = data.radius;
    return this;
  }

  lengthAt(pnt: IVec2): number {
    const center = this.center;
    const radius = this.radius;

    const vec = Vec2Util.sub(pnt, center, []);
    const angle = Math.atan2(vec[1], vec[0]);

    const len = angle * radius;
    return len;
  }

  vertices(): IVec2[] {
    // 返回 0 度点
    return [this.pointAt(0, [])];
  }

  reverse() {
    return this;
  }
}
