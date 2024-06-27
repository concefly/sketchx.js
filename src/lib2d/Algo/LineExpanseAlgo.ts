import { Line } from '../Line';
import { Wire } from '../Wire';
import { BaseAlgo } from './BaseAlgo';
import { Curve } from '../Curve';
import { IntersectAlgo } from './IntersectAlgo';
import { Arc } from '../Arc';
import { VecUtil } from '../../VecUtil';

/**
 * 线条扩展算法
 *
 * @param wire 线条
 * @param width 宽度
 * @param cap 端点样式
 */
export class LineExpanseAlgo extends BaseAlgo {
  constructor(
    public wire: Wire,
    public width: number,
    public cap: 'round' | 'butt' = 'round'
  ) {
    super();
  }

  run() {
    const { wire, width, cap } = this;

    if (width <= 0) return;
    if (wire.length === 0) return;
    if (wire.curves.length === 0) return;

    const halfWidth = width / 2;

    // 暂时只支持线段
    if (wire.curves.every(c => c instanceof Line)) {
      const oriCurves = wire.curves as Line[];

      const mutateCurvesA = oriCurves.map(l => l.clone().normalOffset(-halfWidth));
      const mutateCurvesB = oriCurves.map(l => l.clone().normalOffset(halfWidth));

      // 如果只有一条线段，直接返回
      if (oriCurves.length === 1) {
        // do nothing
      }

      // 多段曲线, 逐段处理
      else {
        // 处理关节
        for (let i = 0; i < oriCurves.length - 1; i++) {
          const c0 = oriCurves[i];
          const c1 = oriCurves[i + 1];
          const ca0 = mutateCurvesA[i];
          const ca1 = mutateCurvesA[i + 1];
          const cb0 = mutateCurvesB[i];
          const cb1 = mutateCurvesB[i + 1];

          // 判断前进方向: 逆时针 1 顺时针 -1 平行 0
          const t0 = c0.tangentAt(c0.length, []);
          const t1 = c1.tangentAt(0, []);

          const cross = VecUtil.cross(t0, t1);
          const direction = cross > 0 ? 1 : cross < 0 ? -1 : 0;

          // 平行
          if (direction === 0) {
            continue;
          } else {
            const istA = IntersectAlgo.equationIntersect(ca0, ca1);
            const istB = IntersectAlgo.equationIntersect(cb0, cb1);

            // 理论上不会出现无交点的情况，如果出现了，直接线段连接
            if (istA.length === 0) {
              const linkLine = new Line([...ca0.p1], [...ca1.p0]);
              mutateCurvesA.splice(i + 1, 0, linkLine);
            }

            if (istB.length === 0) {
              const linkLine = new Line([...cb0.p1], [...cb1.p0]);
              mutateCurvesB.splice(i + 1, 0, linkLine);
            }

            if (istA.length > 0 && istB.length > 0) {
              // 顺时针: A 侧相交，B 侧相离
              if (direction === -1) {
                ca0.p1 = [...istA[0]];
                ca1.p0 = [...istA[0]];
                cb0.p1 = [...istB[0]];
                cb1.p0 = [...istB[0]];
              }

              // 逆时针: A 侧相离，B 侧相交
              else {
                ca0.p1 = [...istA[0]];
                ca1.p0 = [...istA[0]];
                cb0.p1 = [...istB[0]];
                cb1.p0 = [...istB[0]];
              }
            }
          }
        }
      }

      // 反转 B 侧
      mutateCurvesB.forEach(c => c.reverse());
      mutateCurvesB.reverse();

      // 开始处理端点
      let cap0: Curve | null = null;
      let cap1: Curve | null = null;

      const aStartPnt = mutateCurvesA[0].pointAt(0, []);
      const aEndPnt = mutateCurvesA.at(-1)!.pointAt(mutateCurvesA.at(-1)!.length, []);
      const bStartPnt = mutateCurvesB[0].pointAt(0, []);
      const bEndPnt = mutateCurvesB.at(-1)!.pointAt(mutateCurvesB.at(-1)!.length, []);

      // butt
      if (cap === 'butt') {
        cap0 = new Line(bEndPnt, aStartPnt);
        cap1 = new Line(aEndPnt, bStartPnt);
      }

      // round
      if (cap === 'round') {
        cap0 = new Arc(bEndPnt, aStartPnt, 1);
        cap1 = new Arc(aEndPnt, bStartPnt, 1);
      }

      wire.curves.length = 0;

      wire.curves.push(...mutateCurvesA);
      if (cap1) wire.curves.push(cap1 as any);

      wire.curves.push(...mutateCurvesB);
      if (cap0) wire.curves.push(cap0 as any);
    }
  }
}
