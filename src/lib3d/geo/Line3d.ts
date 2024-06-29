import { Curve3d } from './Curve3d';
import { ILine3dData } from '../3d.type';
import { IVec3 } from '../../typing';
import { Vec3Util } from '../../Vec3Util';

export class Line3d extends Curve3d {
  constructor(
    public p0: IVec3,
    public direction: IVec3
  ) {
    super();
  }

  isClosed() {
    return false;
  }

  clone() {
    return new Line3d(this.p0.slice(), this.direction.slice());
  }

  isPointOnCurve(point: IVec3): boolean {
    const v = Vec3Util.sub(point, this.p0, []);
    const t = Vec3Util.dot(v, this.direction) / Vec3Util.lengthSq(this.direction);
    const p = Vec3Util.add(this.p0, Vec3Util.multiplyScalar(this.direction, t, []), []);

    return Vec3Util.equals(p, point);
  }

  toJSON(): ILine3dData {
    return {
      type: 'line3d',
      p0: this.p0.slice(),
      direction: this.direction.slice(),
    };
  }
}
