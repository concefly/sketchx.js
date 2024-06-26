import { ISolid3dData } from '../3d.type';
import { BaseTopo } from './BaseTopo';
import { Face3d } from './Face3d';

export class Solid3d extends BaseTopo {
  constructor(public faces: Face3d[]) {
    super();
  }

  toJSON(): ISolid3dData {
    return {
      type: 'solid3d',
      faces: this.faces.map(face => face.toJSON()),
    };
  }
}
