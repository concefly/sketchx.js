import { Vector3 } from 'three';
import { Surface3d } from './Surface3d';
import { IPlane3dData } from '../3d.type';

export class Plane3d extends Surface3d {
  constructor(
    public normal: Vector3,
    public distance: number
  ) {
    super();
  }

  toJSON(): IPlane3dData {
    return {
      type: 'plane3d',
      normal: this.normal.toArray(),
      distance: this.distance,
    };
  }
}
