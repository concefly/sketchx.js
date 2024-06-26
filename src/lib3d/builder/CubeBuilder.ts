import { Vector3 } from 'three';
import { BaseBuilder } from './BaseBuilder';
import { Solid3d } from '../Topo/Solid3d';
import { PolygonBuilder } from './PolygonBuilder';

export class CubeBuilder extends BaseBuilder {
  constructor(public size = new Vector3(1, 1, 1)) {
    super();
  }

  build() {
    const hs = this.size.clone().multiplyScalar(0.5);

    const faceTop = new PolygonBuilder([
      new Vector3(-hs.x, -hs.y, hs.z),
      new Vector3(hs.x, -hs.y, hs.z),
      new Vector3(hs.x, hs.y, hs.z),
      new Vector3(-hs.x, hs.y, hs.z),
    ]).build();

    const faceBottom = new PolygonBuilder([
      new Vector3(-hs.x, -hs.y, -hs.z),
      new Vector3(-hs.x, hs.y, -hs.z),
      new Vector3(hs.x, hs.y, -hs.z),
      new Vector3(hs.x, -hs.y, -hs.z),
    ]).build();

    const faceFront = new PolygonBuilder([
      new Vector3(-hs.x, -hs.y, -hs.z),
      new Vector3(hs.x, -hs.y, -hs.z),
      new Vector3(hs.x, -hs.y, hs.z),
      new Vector3(-hs.x, -hs.y, hs.z),
    ]).build();

    const faceBack = new PolygonBuilder([
      new Vector3(-hs.x, hs.y, -hs.z),
      new Vector3(-hs.x, hs.y, hs.z),
      new Vector3(hs.x, hs.y, hs.z),
      new Vector3(hs.x, hs.y, -hs.z),
    ]).build();

    const faceLeft = new PolygonBuilder([
      new Vector3(-hs.x, -hs.y, -hs.z),
      new Vector3(-hs.x, -hs.y, hs.z),
      new Vector3(-hs.x, hs.y, hs.z),
      new Vector3(-hs.x, hs.y, -hs.z),
    ]).build();

    const faceRight = new PolygonBuilder([
      new Vector3(hs.x, -hs.y, -hs.z),
      new Vector3(hs.x, hs.y, -hs.z),
      new Vector3(hs.x, hs.y, hs.z),
      new Vector3(hs.x, -hs.y, hs.z),
    ]).build();

    const solid = new Solid3d([faceTop, faceBottom, faceFront, faceBack, faceLeft, faceRight]);

    return solid;
  }
}
