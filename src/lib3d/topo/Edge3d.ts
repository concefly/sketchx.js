import { Vector3 } from 'three';
import { IEdge3dData } from '../3d.type';
import { Curve3d } from '../Geo/Curve3d';
import { BaseTopo } from './BaseTopo';

export class Edge3d extends BaseTopo {
  constructor(
    public curve: Curve3d,
    public p0: Vector3,
    public p1: Vector3
  ) {
    super();
  }

  toJSON(): IEdge3dData {
    return {
      type: 'edge3d',
      curve: this.curve.toJSON(),
      p0: this.p0.toArray(),
      p1: this.p1.toArray(),
    };
  }
}
