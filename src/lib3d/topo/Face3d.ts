import { IFace3dData } from '../3d.type';
import { Surface3d } from '../Geo/Surface3d';
import { BaseTopo } from './BaseTopo';
import { Wire3d } from './Wire3d';

export class Face3d<T extends Surface3d = Surface3d> extends BaseTopo {
  constructor(
    public surface: T,
    public outline: Wire3d,
    public holes: Wire3d[] = []
  ) {
    super();
  }

  toJSON(): IFace3dData {
    return {
      type: 'face3d',
      surface: this.surface.toJSON(),
      outline: this.outline.toJSON(),
      holes: this.holes.map(hole => hole.toJSON()),
    };
  }
}
