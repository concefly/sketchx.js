import { BaseAlgo } from './BaseAlgo';
import { Curve } from '../Curve';
import { IVec2 } from '../../typing';
import { Vec2Util } from '../../Vec2Util';

/** 离散化算法 */
export class DiscretizationAlgo extends BaseAlgo {
  private _rst: IVec2[] = [];

  constructor(
    public curve: Curve,
    public linearDeflection = 0.1,
    public angularDeflection = (10 / 180) * Math.PI,
    public maxDepth = 20
  ) {
    super();
  }

  run() {
    const { curve, linearDeflection, angularDeflection, maxDepth } = this;

    this._rst.length = 0;

    // 二分法，递归
    const recursive = (t0: number, t1: number, depth: number) => {
      const p0 = curve.pointAt(t0, []);

      if (depth > maxDepth) {
        this._rst.push(p0);
        return;
      }

      const p1 = curve.pointAt(t1, []);

      // 两点重合, 直接返回
      if (p0[0] === p1[0] && p0[1] === p1[1]) return;

      // 曲线终点切线
      const t1t = curve.tangentAt(t1, []);

      // 曲线的中点
      const mid = (t0 + t1) / 2;
      const pm = curve.pointAt((t0 + t1) / 2, []);

      // 两点的中点
      const po1m = Vec2Util.center([p0, p1], []);

      // 两点的向量
      // const p01t = new Vector2(p1.x, p1.y).sub(p0).normalize();
      const p01t = Vec2Util.sub(p1, p0, []);
      Vec2Util.normalize(p01t, p01t);

      // 弦高 + 弦角
      const distance = Vec2Util.distanceTo(pm, po1m);

      const angle = Math.abs(Vec2Util.angle(t1t, p01t));

      const linearDelta = distance - linearDeflection;
      const angularDelta = angle - angularDeflection;

      // 如果超过阈值，则递归
      if (linearDelta > 0 || angularDelta > 0) {
        recursive(t0, mid, depth + 1);
        recursive(mid, t1, depth + 1);
      }

      // 否则，添加点，约定添加终点
      else {
        this._rst.push(p1);
      }
    };

    recursive(0, 1, 0);

    // 添加起点
    this._rst.unshift(curve.pointAt(0, []));
    return this._rst;
  }
}
