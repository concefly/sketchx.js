import { Matrix3, Vec2 } from 'three';
import { Curve } from './Curve';
import { ICurveData, ICurveWireData } from './2d.type';
import { Parser } from './Parser';
import { Line } from './Line';
import { TMP_VEC2 } from './TmpVec';
import { VecUtil } from '../VecUtil';

/**
 * A wire is a sequence of curves.
 * @param curves - The curves that make up the wire.
 */
export class Wire extends Curve {
  constructor(public curves: Curve[]) {
    super();
  }

  private _curveAt(len: number): [Curve, number] {
    let sum = 0;

    for (const curve of this.curves) {
      const l = curve.length;

      if (sum + l > len) {
        return [curve, (len - sum) / l];
      }
      sum += l;
    }

    return [this.curves[this.curves.length - 1], 1];
  }

  get length(): number {
    let len = 0;

    for (const curve of this.curves) {
      len += curve.length;
    }

    return len;
  }

  get geoCenter(): Vec2 {
    return VecUtil.center(
      this.curves.map(c => c.geoCenter),
      { x: 0, y: 0 }
    );
  }

  isClosed(): boolean {
    if (this.curves.length === 0) return false;

    const cStart = this.curves[0];
    const cEnd = this.curves[this.curves.length - 1];

    const pTail = cEnd.pointAt(cEnd.length, { x: 0, y: 0 });
    const pHead = cStart.pointAt(0, { x: 0, y: 0 });

    return VecUtil.equals(pTail, pHead);
  }

  close() {
    if (this.curves.length === 0) return;

    const cStart = this.curves[0];
    const cEnd = this.curves[this.curves.length - 1];

    const pTail = cEnd.pointAt(cEnd.length, { x: 0, y: 0 });
    const pHead = cStart.pointAt(0, { x: 0, y: 0 });

    if (!VecUtil.equals(pTail, pHead)) {
      const line = new Line(pTail, pHead);
      this.curves.push(line);
    }
  }

  nearestPoint(pnt: Vec2): number {
    let min = Infinity;

    for (const curve of this.curves) {
      const len = curve.nearestPoint(pnt);
      min = Math.min(min, len);
    }

    return min;
  }

  pointAt(len: number, ref: Vec2): Vec2 {
    const [curve, t] = this._curveAt(len);
    return curve.pointAt(t, ref);
  }

  tangentAt(len: number, ref: Vec2): Vec2 {
    const [curve, t] = this._curveAt(len);
    return curve.tangentAt(t, ref);
  }

  clone(): Wire {
    return new Wire(this.curves.map(c => c.clone()));
  }

  applyMatrix(matrix: Matrix3): void {
    for (const curve of this.curves) {
      curve.applyMatrix(matrix);
    }
  }

  toPolyline(): Vec2[] {
    const points: Vec2[] = [];

    for (let i = 0; i < this.curves.length; i++) {
      const curve = this.curves[i];
      const subPoints = curve.toPolyline();

      if (i < this.curves.length - 1) subPoints.pop();

      points.push(...subPoints);
    }

    return points;
  }

  toJSON(): ICurveWireData {
    return {
      type: 'wire',
      curves: this.curves.map(c => c.toJSON()),
    };
  }

  fromJSON(data: ICurveWireData) {
    this.curves.length = 0;

    for (const cur of data.curves) {
      const curve = Parser.parseCurve(cur);
      this.curves.push(curve);
    }

    return this;
  }

  fromPolyline(points: Vec2[], close = false) {
    this.curves.length = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = { ...points[i] };
      const p1 = { ...points[i + 1] };
      const line = new Line(p0, p1);
      this.curves.push(line);
    }

    if (close) {
      const p0 = { ...points[points.length - 1] };
      const p1 = { ...points[0] };

      if (!VecUtil.equals(p0, p1)) {
        const line = new Line(p0, p1);
        this.curves.push(line);
      }
    }

    return this;
  }

  /** 查找曲线 */
  findCurveByPnt(pnt: Vec2): { curve: Curve; len: number }[] {
    const result: { curve: Curve; len: number }[] = [];

    let len = 0;

    for (const curve of this.curves) {
      const l = curve.lengthAt(pnt);

      if (l !== null) {
        result.push({ curve, len: len + l });
      }

      len += curve.length;
    }

    return result;
  }

  lengthAt(pnt: Vec2): number | null {
    let len = 0;

    for (const curve of this.curves) {
      const l = curve.lengthAt(pnt);

      if (l !== null) {
        return len + l;
      }

      len += curve.length;
    }

    return null;
  }

  vertices() {
    const list: Vec2[] = [];

    for (const curve of this.curves) {
      list.push(curve.pointAt(0, { x: 0, y: 0 }));
    }

    return list;
  }

  containingCurveTypes(): ICurveData['type'][] {
    const types: ICurveData['type'][] = [];

    for (const curve of this.curves) {
      if (curve instanceof Wire) types.push(...curve.containingCurveTypes());
      else types.push(curve.toJSON().type);
    }

    return types;
  }

  reverse() {
    this.curves.reverse();

    for (const curve of this.curves) {
      curve.reverse();
    }
    return this;
  }

  removeZeroLength(tolerance: number = 1e-6) {
    this.curves = this.curves.filter(c => c.length > tolerance);
    return this;
  }
}
