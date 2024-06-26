import { ISurface3dData } from '../3d.type';

export abstract class Surface3d {
  abstract toJSON(): ISurface3dData;
}
