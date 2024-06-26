import { BaseAlgo3d } from './BaseAlgo3d';
import { oc, triangulate } from '../../extension/occ';
import { OccConverter } from '../Converter/OccConverter';
import { BufferAttribute, BufferGeometry } from 'three';
import { BaseTopo } from '../Topo/BaseTopo';

export class DiscretizationAlgo3d extends BaseAlgo3d {
  constructor(public shape: BaseTopo | null) {
    super();
  }

  private _occConverter = new OccConverter();

  run() {
    if (!this.shape) return null;

    const brep = this._occConverter.export(this.shape);
    const $shape = OccConverter.brepFileToShape(brep);

    const tri = triangulate($shape);
    const buf = new BufferGeometry();

    // line
    if (tri.isLine) {
      buf.setAttribute('position', new BufferAttribute(new Float32Array(tri.vertices), 2));
    }

    // triangulation
    else {
      buf.setAttribute('position', new BufferAttribute(new Float32Array(tri.vertices), 3));

      if (tri.normals) buf.setAttribute('normal', new BufferAttribute(new Float32Array(tri.normals), 3));
      else buf.computeVertexNormals();

      if (tri.indices) buf.setIndex(tri.indices);
    }

    buf.computeBoundingBox();
    buf.computeBoundingSphere();

    return buf;
  }
}
