import { BaseAlgo } from './BaseAlgo';
import { Line } from '../Line';
import * as nc from 'numeric';
import { Circle } from '../Circle';
import { Wire } from '../Wire';
import { ICurveData } from '../2d.type';
import { Arc } from '../Arc';
import { Curve } from '../Curve';
import { IVec2 } from '../../typing';
import { Vec2Util } from '../../Vec2Util';

const RuleList: { target: ICurveData['type']; minPntCnt: number }[] = [
  { target: 'line', minPntCnt: 3 },
  { target: 'arc', minPntCnt: 5 },
  { target: 'circle', minPntCnt: 4 },
];

/** 拟合算法 */
export class FittingAlgo extends BaseAlgo {
  /**
   * 二维点集拟合直线
   */
  static fitLine(pnts: IVec2[]): Line {
    const len = pnts.length;
    if (len < 2) throw new Error('at least 2 points required');

    let sumX = 0;
    let sumY = 0;
    let sumXX = 0;
    let sumXY = 0;

    let minX = pnts[0][0];
    let maxX = pnts[0][0];
    let minY = pnts[0][1];
    let maxY = pnts[0][1];

    for (const p of pnts) {
      sumX += p[0];
      sumY += p[1];
      sumXX += p[0] * p[0];
      sumXY += p[0] * p[1];

      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
    }

    const meanX = sumX / len;
    const meanY = sumY / len;

    // 求 x 的方差
    let vX = 0;
    for (const p of pnts) vX += (p[0] - meanX) ** 2;

    vX /= len;

    let line: Line;

    // 判断是否为垂直线
    if (vX < 1e-6) {
      line = new Line([meanX, minY], [meanX, maxY]);
    } else {
      // 最小二乘法拟合直线
      const m = (sumXY - len * meanX * meanY) / (sumXX - len * meanX * meanX);
      const c = meanY - m * meanX;
      line = new Line([minX, m * minX + c], [maxX, m * maxX + c]);
    }

    return line;
  }

  /**
   * 二维点集拟合圆
   */
  static fitCircle(pnts: IVec2[]): Circle {
    // 最小二乘法拟合圆
    const len = pnts.length;

    // 构建矩阵
    const ma: number[][] = nc.rep([len, 3], 0) as any;
    const mb: number[] = new Array(len).fill(0);

    for (let i = 0; i < len; i++) {
      const p = pnts[i];
      ma[i][0] = p[0];
      ma[i][1] = p[1];
      ma[i][2] = 1;

      mb[i] = p[0] ** 2 + p[1] ** 2;
    }

    // 解线性方程组: (A^T * A)^{-1} * A^T * B
    let mx: any = nc.transpose(ma);
    mx = nc.dot(mx, ma);
    mx = nc.inv(mx);
    mx = nc.dot(mx, nc.transpose(ma));
    mx = nc.dot(mx, mb);

    // 求圆心和半径
    const cx = mx[0] / 2;
    const cy = mx[1] / 2;
    const r = Math.sqrt(cx * cx + cy * cy + mx[2]);

    return new Circle([cx, cy], r);
  }

  /**
   * 二维点集拟合圆弧
   */
  static fitArc(pnts: IVec2[]): Arc {
    const circle = FittingAlgo.fitCircle(pnts);

    const start = pnts[0];
    const end = pnts[pnts.length - 1];
    const mid = circle.center;

    const startAngle = Math.atan2(start[1] - mid[1], start[0] - mid[0]);
    const endAngle = Math.atan2(end[1] - mid[1], end[0] - mid[0]);

    let bulge = Math.abs(Math.tan((endAngle - startAngle) / 4));

    // 判断正逆时针
    const curveMinPnt = pnts[pnts.length >> 1];

    const v0 = Vec2Util.sub(end, start, []);
    Vec2Util.normalize(v0, v0);

    const v1 = Vec2Util.sub(curveMinPnt, start, []);
    Vec2Util.normalize(v1, v1);

    const cross = Vec2Util.cross(v0, v1);

    if (cross > 0) bulge *= -1;

    return new Arc(start, end, bulge);
  }

  /** 分割点集. 比较相邻两点的夹角, 夹角大于容差值则分割
   * @param pnts 二维点集
   * @param tolerance angle 容差值
   */
  static split(pnts: IVec2[], tolerance: number): IVec2[][] {
    const len = pnts.length;
    if (len < 3) return [pnts];

    const results: IVec2[][] = [];
    let seg: IVec2[] = [pnts[0]];

    const v0 = [0, 0];
    const v1 = [0, 0];

    for (let i = 1; i < len - 1; i++) {
      const p0 = pnts[i - 1];
      const p1 = pnts[i];
      const p2 = pnts[i + 1];

      Vec2Util.sub(p1, p0, v0);
      Vec2Util.sub(p2, p1, v1);

      Vec2Util.normalize(v0, v0);
      Vec2Util.normalize(v1, v1);

      const angle = Math.acos(Vec2Util.dot(v0, v1));

      if (angle > tolerance) {
        seg.push(p1);
        results.push(seg);
        seg = [[...p1]];
      } else {
        seg.push(p1);
      }
    }

    seg.push(pnts[len - 1]);
    results.push(seg);

    return results;
  }

  constructor(
    public pnts: IVec2[],
    public splitAngleTolerance: number = Math.PI / 90
  ) {
    super();
  }

  run(): Wire {
    const pntsChunk = FittingAlgo.split(this.pnts, this.splitAngleTolerance);
    const wire = new Wire([]);

    for (const pnts of pntsChunk) {
      const curveInfos: { curve: Curve; variance: number }[] = [];

      // 拟合
      for (const rule of RuleList) {
        let curve: Curve;

        if (rule.target === 'line' && pnts.length >= rule.minPntCnt) curve = FittingAlgo.fitLine(pnts);
        else if (rule.target === 'arc' && pnts.length >= rule.minPntCnt) curve = FittingAlgo.fitArc(pnts);
        else if (rule.target === 'circle' && pnts.length >= rule.minPntCnt) curve = FittingAlgo.fitCircle(pnts);
        else curve = new Line([...pnts[0]], [...pnts[pnts.length - 1]]);

        const variance = calcVariance(pnts, curve);
        curveInfos.push({ curve, variance });
      }

      if (curveInfos.length === 0) continue;

      // 选择方差最小的曲线
      curveInfos.sort((a, b) => a.variance - b.variance);
      const bestCurve = curveInfos[0].curve;

      wire.curves.push(bestCurve);
    }

    wire.removeZeroLength();

    return wire;
  }
}

/** 求点集方差 */
function calcVariance(pnts: IVec2[], curve: Curve) {
  let lenSum = 0;
  const pntOnCurve = [0, 0];

  let variance = 0;

  // 逐点计算距离
  variance += Vec2Util.distanceTo(pnts[0], curve.pointAt(0, pntOnCurve)) ** 2;

  for (let i = 1; i < pnts.length; i++) {
    const p0 = pnts[i - 1];
    const pt = pnts[i];

    lenSum += Vec2Util.distanceTo(p0, pt);

    curve.pointAt(lenSum, pntOnCurve);
    const dis = Vec2Util.distanceTo(pt, pntOnCurve);

    variance += dis ** 2;
  }

  return variance / pnts.length;
}
