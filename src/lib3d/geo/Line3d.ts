import { Matrix4, Vector3 } from 'three';
import { Curve3d } from './Curve3d';
import { ILine3dData } from '../3d.type';

export class Line3d extends Curve3d {
  constructor(
    public p0: Vector3,
    public direction: Vector3
  ) {
    super();
  }

  isClosed() {
    return false;
  }

  clone() {
    return new Line3d(this.p0.clone(), this.direction.clone());
  }

  isPointOnCurve(point: Vector3): boolean {
    const v = point.clone().sub(this.p0);
    const t = v.dot(this.direction) / this.direction.lengthSq();
    const p = this.p0.clone().add(this.direction.clone().multiplyScalar(t));
    return p.equals(point);
  }

  toJSON(): ILine3dData {
    return {
      type: 'line3d',
      p0: this.p0.toArray(),
      direction: this.direction.toArray(),
    };
  }
}
