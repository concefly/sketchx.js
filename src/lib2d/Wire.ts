import { Matrix3, Vector2 } from 'three';
import { Curve } from './Curve';
import { ICurveData, ICurveWireData } from './2d.type';
import { Parser } from './Parser';
import { Line } from './Line';
import { TMP_VEC2 } from './TmpVec';

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

  get geoCenter(): Vector2 {
    const center = new Vector2();

    for (const curve of this.curves) {
      center.add(curve.geoCenter);
    }

    return center.divideScalar(this.curves.length);
  }

  isClosed(): boolean {
    if (this.curves.length === 0) return false;

    const cStart = this.curves[0];
    const cEnd = this.curves[this.curves.length - 1];

    const pTail = cEnd.pointAt(cEnd.length, new Vector2());
    const pHead = cStart.pointAt(0, new Vector2());

    return pTail.equals(pHead);
  }

  close() {
    if (this.curves.length === 0) return;

    const cStart = this.curves[0];
    const cEnd = this.curves[this.curves.length - 1];

    const pTail = cEnd.pointAt(cEnd.length, new Vector2());
    const pHead = cStart.pointAt(0, new Vector2());

    if (!pTail.equals(pHead)) {
      const line = new Line(pTail, pHead);
      this.curves.push(line);
    }
  }

  nearestPoint(pnt: Vector2): number {
    let min = Infinity;

    for (const curve of this.curves) {
      const len = curve.nearestPoint(pnt);
      min = Math.min(min, len);
    }

    return min;
  }

  pointAt(len: number, ref: Vector2): Vector2 {
    const [curve, t] = this._curveAt(len);
    return curve.pointAt(t, ref);
  }

  tangentAt(len: number, ref: Vector2): Vector2 {
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

  toPolyline(): Vector2[] {
    const points: Vector2[] = [];

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

  fromPolyline(points: Vector2[], close = false) {
    this.curves.length = 0;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i].clone();
      const p1 = points[i + 1].clone();
      const line = new Line(p0, p1);
      this.curves.push(line);
    }

    if (close) {
      const p0 = points[points.length - 1].clone();
      const p1 = points[0].clone();

      if (!p0.equals(p1)) {
        const line = new Line(p0, p1);
        this.curves.push(line);
      }
    }

    return this;
  }

  /** 查找曲线 */
  findCurveByPnt(pnt: Vector2): { curve: Curve; len: number }[] {
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

  lengthAt(pnt: Vector2): number | null {
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
    const list: Vector2[] = [];

    for (const curve of this.curves) {
      list.push(curve.pointAt(0, new Vector2()));
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
