import { Vector3 } from 'three';
import { ICurve3dData } from '../3d.type';

export abstract class Curve3d {
  /** 曲线是否闭合 */
  abstract isClosed(): boolean;
  abstract clone(): Curve3d;
  abstract toJSON(): ICurve3dData;

  abstract isPointOnCurve(point: Vector3): boolean;
}
