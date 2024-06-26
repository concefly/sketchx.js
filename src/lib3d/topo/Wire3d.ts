import { IWire3dData } from '../3d.type';
import { BaseTopo } from './BaseTopo';
import { Edge3d } from './Edge3d';

export class Wire3d extends BaseTopo {
  constructor(public edges: Edge3d[]) {
    super();
  }

  toJSON(): IWire3dData {
    return {
      type: 'wire3d',
      edges: this.edges.map(edge => edge.toJSON()),
    };
  }
}
