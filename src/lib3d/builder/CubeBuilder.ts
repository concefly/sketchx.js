import { BaseBuilder } from './BaseBuilder';
import { Solid3d } from '../Topo/Solid3d';
import { PolygonBuilder } from './PolygonBuilder';

export class CubeBuilder extends BaseBuilder {
  constructor(public size: number[] = [1, 1, 1]) {
    super();
  }

  build() {
    const hs = this.size.map(s => s * 0.5);

    const faceTop = new PolygonBuilder([
      [-hs[0], -hs[1], hs[2]],
      [hs[0], -hs[1], hs[2]],
      [hs[0], hs[1], hs[2]],
      [-hs[0], hs[1], hs[2]],
    ]).build();

    const faceBottom = new PolygonBuilder([
      [-hs[0], -hs[1], -hs[2]],
      [-hs[0], hs[1], -hs[2]],
      [hs[0], hs[1], -hs[2]],
      [hs[0], -hs[1], -hs[2]],
    ]).build();

    const faceFront = new PolygonBuilder([
      [-hs[0], -hs[1], -hs[2]],
      [hs[0], -hs[1], -hs[2]],
      [hs[0], -hs[1], hs[2]],
      [-hs[0], -hs[1], hs[2]],
    ]).build();

    const faceBack = new PolygonBuilder([
      [-hs[0], hs[1], -hs[2]],
      [-hs[0], hs[1], hs[2]],
      [hs[0], hs[1], hs[2]],
      [hs[0], hs[1], -hs[2]],
    ]).build();

    const faceLeft = new PolygonBuilder([
      [-hs[0], -hs[1], -hs[2]],
      [-hs[0], -hs[1], hs[2]],
      [-hs[0], hs[1], hs[2]],
      [-hs[0], hs[1], -hs[2]],
    ]).build();

    const faceRight = new PolygonBuilder([
      [hs[0], -hs[1], -hs[2]],
      [hs[0], hs[1], -hs[2]],
      [hs[0], hs[1], hs[2]],
      [hs[0], -hs[1], hs[2]],
    ]).build();

    const solid = new Solid3d([faceTop, faceBottom, faceFront, faceBack, faceLeft, faceRight]);

    return solid;
  }
}
