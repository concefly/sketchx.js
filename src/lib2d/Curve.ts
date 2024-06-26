import { Matrix3, Vector2 } from 'three';
import { ICurveData } from './2d.type';

export abstract class Curve {
  /** 曲线长度 */
  abstract get length(): number;

  /** 曲线中心 */
  abstract get geoCenter(): Vector2;

  /** 曲线是否闭合 */
  abstract isClosed(): boolean;

  /** 求最近点 */
  abstract nearestPoint(pnt: Vector2): number;

  /** 曲线上的点 */
  abstract pointAt(len: number, ref: Vector2): Vector2;

  /** 曲线上的切线 */
  abstract tangentAt(len: number, ref: Vector2): Vector2;

  abstract lengthAt(pnt: Vector2): number | null;

  abstract clone(): Curve;
  abstract applyMatrix(matrix: Matrix3): void;

  /** 序列化 */
  abstract toJSON(): ICurveData;

  /** 反序列化 */
  abstract fromJSON(data: any): this;

  /** 反转 */
  abstract reverse(): this;

  /** 拟合成 polyline */
  abstract toPolyline(): Vector2[];
  abstract vertices(): Vector2[];
}
