import { ITopo3dData } from '../3d.type';

export abstract class BaseTopo {
  abstract toJSON(): ITopo3dData;
}
