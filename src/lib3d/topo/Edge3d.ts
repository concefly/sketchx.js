import { IVec3 } from '../../typing';
import { IEdge3dData } from '../3d.type';
import { Curve3d } from '../Geo/Curve3d';
import { BaseTopo } from './BaseTopo';

export class Edge3d extends BaseTopo {
  constructor(
    public curve: Curve3d,
    public p0: IVec3,
    public p1: IVec3
  ) {
    super();
  }

  toJSON(): IEdge3dData {
    return {
      type: 'edge3d',
      curve: this.curve.toJSON(),
      p0: this.p0.slice(),
      p1: this.p1.slice(),
    };
  }
}
