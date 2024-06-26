import { BaseTopo } from '../Topo/BaseTopo';

export abstract class BaseConverter<T> {
  abstract import(data: T): BaseTopo;
  abstract export(topo: BaseTopo): T;
}
