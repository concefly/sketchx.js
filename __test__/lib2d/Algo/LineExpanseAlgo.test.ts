import { Vector2 } from 'three';
import { Arc, Line, LineExpanseAlgo, Wire } from '../../../src/lib2d';
import { _descWire } from '../util';

describe('LineExpanseAlgo', () => {
  it('zero scale line - butt', () => {
    const wire = new Wire([new Line(new Vector2(0, 0), new Vector2(0, 0))]);
    new LineExpanseAlgo(wire, 2, 'butt').run();

    const desc = _descWire(wire);
    expect(desc).toEqual([['line', [0, 0]]]);
  });

  it('1 line - butt', () => {
    const wire = new Wire([new Line(new Vector2(0, 0), new Vector2(10, 0))]);
    new LineExpanseAlgo(wire, 2, 'butt').run();

    const desc = _descWire(wire);
    expect(desc).toEqual([
      ['line', [0, -1, 10, -1]],
      ['line', [10, -1, 10, 1]],
      ['line', [10, 1, 0, 1]],
      ['line', [0, 1, 0, -1]],
    ]);
  });

  it('2 line - butt', () => {
    const wire = new Wire([new Line(new Vector2(0, 0), new Vector2(10, 0)), new Line(new Vector2(10, 0), new Vector2(10, 10))]);
    new LineExpanseAlgo(wire, 2, 'butt').run();

    const desc = _descWire(wire);
    expect(desc).toEqual([
      ['line', [0, -1, 11, -1]],
      ['line', [11, -1, 11, 10]],
      ['line', [11, 10, 9, 10]],
      ['line', [9, 10, 9, 1]],
      ['line', [9, 1, 0, 1]],
      ['line', [0, 1, 0, -1]],
    ]);
  });

  it('3 line - butt', () => {
    const wire = new Wire([
      new Line(new Vector2(0, -5), new Vector2(10, -5)),
      new Line(new Vector2(10, -5), new Vector2(10, 5)),
      new Line(new Vector2(10, 5), new Vector2(0, 5)),
    ]);
    new LineExpanseAlgo(wire, 4, 'butt').run();

    const desc = _descWire(wire);

    expect(wire.curves.length).toBe(8);
    expect(desc).toEqual([
      ['line', [0, -7, 12, -7]],
      ['line', [12, -7, 12, 7]],
      ['line', [12, 7, 0, 7]],
      ['line', [0, 7, 0, 3]],
      ['line', [0, 3, 8, 3]],
      ['line', [8, 3, 8, -3]],
      ['line', [8, -3, 0, -3]],
      ['line', [0, -3, 0, -7]],
    ]);
  });

  it('1 line - round', () => {
    const wire = new Wire([new Line(new Vector2(0, 0), new Vector2(10, 0))]);
    new LineExpanseAlgo(wire, 2, 'round').run();

    const desc = _descWire(wire);
    expect(desc).toEqual([
      ['line', [0, -1, 10, -1]],
      ['arc', [10, -1, 11, 0, 10, 1]],
      ['line', [10, 1, 0, 1]],
      ['arc', [0, 1, -1, 0, 0, -1]],
    ]);
  });
});
