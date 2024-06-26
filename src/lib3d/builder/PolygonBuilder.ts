import { Vector3 } from 'three';
import { BaseBuilder } from './BaseBuilder';
import { Wire3d } from '../Topo/Wire3d';
import { Edge3d } from '../Topo/Edge3d';
import { Line3d } from '../Geo/Line3d';
import { Face3d } from '../Topo/Face3d';
import { Plane3d } from '../Geo/Plane3d';
import { FittingAlgo3d } from '../Algo/FittingAlgo3d';

export class PolygonBuilder extends BaseBuilder {
  constructor(
    public outline: Vector3[],
    public holes: Vector3[][] = []
  ) {
    super();
  }

  build() {
    // surface
    const surface = FittingAlgo3d.fitPlane(this.outline);

    // outline
    const outlineEdges = this.outline.map((p, i) => {
      const p0 = p;
      const p1 = this.outline[(i + 1) % this.outline.length];
      return new Edge3d(new Line3d(p0, p1.clone().sub(p0).normalize()), p0, p1);
    });

    const outlineWire = new Wire3d(outlineEdges);

    // holes
    const holeWires = this.holes.map(hole => {
      const holeEdges = hole.map((p, i) => {
        const p0 = p;
        const p1 = hole[(i + 1) % hole.length];
        return new Edge3d(new Line3d(p0, p1.clone().sub(p0).normalize()), p0, p1);
      });

      return new Wire3d(holeEdges);
    });

    const face = new Face3d(surface, outlineWire, holeWires);
    return face;
  }
}
