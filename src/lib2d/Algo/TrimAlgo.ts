import { Vector2 } from 'three';
import { Curve } from '../Curve';
import { Line } from '../Line';
import { BaseAlgo } from './BaseAlgo';

/** 曲线剪裁 */
export class TrimAlgo extends BaseAlgo {
  constructor(
    public curve: Curve,
    public start: number,
    public end: number
  ) {
    super();
  }

  run() {
    const { curve, start, end } = this;

    if (start === 0 && end === curve.length) return curve;

    if (curve instanceof Line) {
      const p0 = curve.pointAt(start, new Vector2());
      const p1 = curve.pointAt(end, new Vector2());

      curve.p0.copy(p0);
      curve.p1.copy(p1);
    }

    return curve;
  }
}
