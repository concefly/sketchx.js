import { IVec3 } from '../../typing';
import { ICurve3dData } from '../3d.type';

export abstract class Curve3d {
  /** 曲线是否闭合 */
  abstract isClosed(): boolean;
  abstract clone(): Curve3d;
  abstract toJSON(): ICurve3dData;

  abstract isPointOnCurve(point: IVec3): boolean;
}
