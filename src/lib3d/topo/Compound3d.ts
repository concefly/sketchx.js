import { ICompound3dData } from '../3d.type';
import { BaseTopo } from './BaseTopo';
import { Solid3d } from './Solid3d';

export class Compound3d extends BaseTopo {
  constructor(public solids: Solid3d[] = []) {
    super();
  }

  toJSON(): ICompound3dData {
    return {
      type: 'compound3d',
      solids: this.solids.map(solid => solid.toJSON()),
    };
  }
}
