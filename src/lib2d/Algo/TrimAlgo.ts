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
      const p0 = curve.pointAt(start, []);
      const p1 = curve.pointAt(end, []);

      curve.p0 = p0;
      curve.p1 = p1;
    }

    return curve;
  }
}
