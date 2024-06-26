import { Vector2 } from 'three';
import { BaseAlgo } from './BaseAlgo';
import { Curve } from '../Curve';

/** 离散化算法 */
export class DiscretizationAlgo extends BaseAlgo {
  private _rst: Vector2[] = [];

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
      const p0 = curve.pointAt(t0, new Vector2());

      if (depth > maxDepth) {
        this._rst.push(p0);
        return;
      }

      const p1 = curve.pointAt(t1, new Vector2());

      // 两点重合, 直接返回
      if (p0.equals(p1)) return;

      // 曲线终点切线
      const t1t = curve.tangentAt(t1, new Vector2());

      // 曲线的中点
      const mid = (t0 + t1) / 2;
      const pm = curve.pointAt((t0 + t1) / 2, new Vector2());

      // 两点的中点
      const p01m = new Vector2((p0.x + p1.x) / 2, (p0.y + p1.y) / 2);
      // 两点的向量
      const p01t = p1.clone().sub(p0).normalize();

      // 弦高 + 弦角
      const distance = pm.distanceTo(p01m);
      const angle = Math.abs(t1t.angleTo(p01t));

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
    this._rst.unshift(curve.pointAt(0, new Vector2()));
    return this._rst;
  }
}
