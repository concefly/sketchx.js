import { Vector2, Vec2 } from 'three';
import { Curve } from '../Curve';
import { Wire } from '../Wire';
import { BaseAlgo } from './BaseAlgo';
import { IntersectAlgo } from './IntersectAlgo';
import { Line } from '../Line';
import { TrimAlgo } from './TrimAlgo';
import { Face } from '../Face';

/** 倒角算法
 * @param wire 线框
 * @param pnts 进行倒角的点
 * @param d0 倒角距离0
 * @param d1 倒角距离1
 */
export class ChamferAlgo<T extends Wire | Face> extends BaseAlgo {
  constructor(
    public target: T,
    public pnts: Vec2[],
    public d0: number,
    public d1: number
  ) {
    super();
  }

  private execWire(target: Wire) {
    const { d0, d1, pnts } = this;

    for (const pnt of pnts) {
      const _curves = target.findCurveByPnt(pnt);
      if (_curves.length < 2) return null;

      const c0 = _curves[0].curve;
      const c1 = _curves[1].curve;

      const c0Index = target.curves.indexOf(c0);
      const c1Index = target.curves.indexOf(c1);

      if (c0Index === -1 || c1Index === -1) return null;

      // 1. 计算两条曲线的交点
      const intersects = new IntersectAlgo(c0, c1).run();
      if (intersects.length === 0) return null;

      const [t0, t1] = intersects[0];

      // 量取方向
      const lenDir0 = t0 === 0 ? 1 : t0 === c0.length ? -1 : 1;
      const lenDir1 = t1 === 0 ? 1 : t1 === c1.length ? -1 : 1;

      // 2. 分别从交点处向两端量取距离
      const t0c = t0 + lenDir0 * d0;
      const t1c = t1 + lenDir1 * d1;

      if (t0c < 0 || t0c > c0.length || t1c < 0 || t1c > c1.length) return null;

      const p0 = c0.pointAt(t0c, new Vector2());
      const p1 = c1.pointAt(t1c, new Vector2());

      // 3. 构建倒角线
      const cc = new Line(p0, p1);
      const c0Trimmed = (lenDir0 > 0 ? new TrimAlgo(c0.clone(), t0c, c0.length) : new TrimAlgo(c0.clone(), 0, t0c)).run();
      const c1Trimmed = (lenDir1 > 0 ? new TrimAlgo(c1.clone(), t1c, c1.length) : new TrimAlgo(c1.clone(), 0, t1c)).run();

      target.curves[c0Index] = c0Trimmed;
      target.curves[c1Index] = c1Trimmed;

      if (c0Index === 0 && c1Index === target.curves.length - 1) target.curves.unshift(cc);
      else target.curves.splice(c0Index + 1, 0, cc);
    }
  }

  private execFace(target: Face) {
    if (target.outline instanceof Wire) this.execWire(target.outline);

    for (const hole of target.holes) {
      if (hole instanceof Wire) this.execWire(hole);
    }
  }

  run() {
    const { target, d0, d1 } = this;
    if (d0 === 0 || d1 === 0) return null;

    if (target instanceof Wire) this.execWire(target);
    if (target instanceof Face) this.execFace(target);

    return target;
  }
}
