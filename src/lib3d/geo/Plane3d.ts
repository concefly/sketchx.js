import { Surface3d } from './Surface3d';
import { IPlane3dData } from '../3d.type';
import { IVec3 } from '../../typing';

export class Plane3d extends Surface3d {
  constructor(
    public normal: IVec3,
    public distance: number
  ) {
    super();
  }

  toJSON(): IPlane3dData {
    return {
      type: 'plane3d',
      normal: this.normal.slice(),
      distance: this.distance,
    };
  }
}
