import { Vector2 } from 'three';
import { Wire } from '../../src/lib2d/Wire';
import { Arc } from '../../src/lib2d/Arc';

export function _descWire(wire: Wire) {
  return wire.curves.map(c => {
    let polyline: Vector2[] = [];

    if (c instanceof Arc) polyline = c.toPolyline(2);
    else polyline = c.toPolyline();

    return [
      c.toJSON().type,
      polyline
        .map(p => [p.x, p.y])
        .flat()
        .map(v => Math.round(v * 10) / 10)
        .map(v => (v === -0 ? 0 : v)),
    ] as const;
  });
}
