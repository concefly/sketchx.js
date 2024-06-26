import { Vector2 } from 'three';
import { BaseAlgo } from './BaseAlgo';
import { Line } from '../Line';
import * as nc from 'numeric';
import { Circle } from '../Circle';
import { Wire } from '../Wire';
import { ICurveData } from '../2d.type';
import { Arc } from '../Arc';
import { Curve } from '../Curve';

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
  static fitLine(pnts: Vector2[]): Line {
    const len = pnts.length;
    if (len < 2) throw new Error('at least 2 points required');

    let sumX = 0;
    let sumY = 0;
    let sumXX = 0;
    let sumXY = 0;

    let minX = pnts[0].x;
    let maxX = pnts[0].x;
    let minY = pnts[0].y;
    let maxY = pnts[0].y;

    for (const p of pnts) {
      sumX += p.x;
      sumY += p.y;
      sumXX += p.x * p.x;
      sumXY += p.x * p.y;

      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const meanX = sumX / len;
    const meanY = sumY / len;

    // 求 x 的方差
    let vX = 0;
    for (const p of pnts) vX += (p.x - meanX) ** 2;

    vX /= len;

    let line: Line;

    // 判断是否为垂直线
    if (vX < 1e-6) {
      line = new Line(new Vector2(meanX, minY), new Vector2(meanX, maxY));
    } else {
      // 最小二乘法拟合直线
      const m = (sumXY - len * meanX * meanY) / (sumXX - len * meanX * meanX);
      const c = meanY - m * meanX;
      line = new Line(new Vector2(minX, m * minX + c), new Vector2(maxX, m * maxX + c));
    }

    return line;
  }

  /**
   * 二维点集拟合圆
   */
  static fitCircle(pnts: Vector2[]): Circle {
    // 最小二乘法拟合圆
    const len = pnts.length;

    // 构建矩阵
    const ma: number[][] = nc.rep([len, 3], 0) as any;
    const mb: number[] = new Array(len).fill(0);

    for (let i = 0; i < len; i++) {
      const p = pnts[i];
      ma[i][0] = p.x;
      ma[i][1] = p.y;
      ma[i][2] = 1;

      mb[i] = p.x ** 2 + p.y ** 2;
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

    return new Circle(new Vector2(cx, cy), r);
  }

  /**
   * 二维点集拟合圆弧
   */
  static fitArc(pnts: Vector2[]): Arc {
    const circle = FittingAlgo.fitCircle(pnts);

    const start = pnts[0];
    const end = pnts[pnts.length - 1];
    const mid = circle.center;

    const startAngle = Math.atan2(start.y - mid.y, start.x - mid.x);
    const endAngle = Math.atan2(end.y - mid.y, end.x - mid.x);

    let bulge = Math.abs(Math.tan((endAngle - startAngle) / 4));

    // 判断正逆时针
    const curveMinPnt = pnts[pnts.length >> 1];
    const v0 = new Vector2().copy(end).sub(start).normalize();
    const v1 = new Vector2().copy(curveMinPnt).sub(start).normalize();
    const cross = v0.cross(v1);

    if (cross > 0) bulge *= -1;

    return new Arc(start, end, bulge);
  }

  /** 分割点集. 比较相邻两点的夹角, 夹角大于容差值则分割
   * @param pnts 二维点集
   * @param tolerance angle 容差值
   */
  static split(pnts: Vector2[], tolerance: number): Vector2[][] {
    const len = pnts.length;
    if (len < 3) return [pnts];

    const results: Vector2[][] = [];
    let seg: Vector2[] = [pnts[0]];

    const v0 = new Vector2();
    const v1 = new Vector2();

    for (let i = 1; i < len - 1; i++) {
      const p0 = pnts[i - 1];
      const p1 = pnts[i];
      const p2 = pnts[i + 1];

      v0.copy(p1).sub(p0).normalize();
      v1.copy(p2).sub(p1).normalize();

      const angle = Math.acos(v0.dot(v1));

      if (angle > tolerance) {
        seg.push(p1);
        results.push(seg);
        seg = [p1.clone()]; // p1 会被重复添加, 所以要 clone, 避免多次引用造成的问题
      } else {
        seg.push(p1);
      }
    }

    seg.push(pnts[len - 1]);
    results.push(seg);

    return results;
  }

  constructor(
    public pnts: Vector2[],
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
        else curve = new Line(pnts[0].clone(), pnts[pnts.length - 1].clone());

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
function calcVariance(pnts: Vector2[], curve: Curve) {
  let lenSum = 0;
  const pntOnCurve = new Vector2();

  let variance = 0;

  // 逐点计算距离
  variance += pnts[0].distanceTo(curve.pointAt(0, pntOnCurve)) ** 2;

  for (let i = 1; i < pnts.length; i++) {
    const p0 = pnts[i - 1];
    const pt = pnts[i];

    lenSum += pt.distanceTo(p0);

    curve.pointAt(lenSum, pntOnCurve);
    const dis = pntOnCurve.distanceTo(pt);

    variance += dis ** 2;
  }

  return variance / pnts.length;
}
