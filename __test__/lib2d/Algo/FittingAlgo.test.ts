import { FittingAlgo } from '../../../src/lib2d/Algo/FittingAlgo';
import { Arc } from '../../../src/lib2d/Arc';
import { _descWire } from '../util';

describe('FittingAlgo.split', () => {
  test('collinear', () => {
    const pnts: number[][] = [
      [0, 0],
      [1, 1],
      [2, 2],
    ];
    const tolerance = 0.1;

    const results = FittingAlgo.split(pnts, tolerance);
    const rstPnts = results.map(seg => seg.map(p => p));

    expect(rstPnts).toEqual([
      [
        [0, 0],
        [1, 1],
        [2, 2],
      ],
    ]);
  });

  test('excess tolerance', () => {
    const pnts: number[][] = [
      [0, 0],
      [1, 1],
      [2, 3],
    ];
    const tolerance = 0.1;

    const results = FittingAlgo.split(pnts, tolerance);
    const rstPnts = results.map(seg => seg.map(p => p));

    expect(rstPnts).toEqual([
      [
        [0, 0],
        [1, 1],
      ],
      [
        [1, 1],
        [2, 3],
      ],
    ]);
  });
});

describe('FittingAlgo.fitArc', () => {
  test('00 -> 11, 1', () => {
    const pnts: number[][] = new Arc([0, 0], [1, 1], 1).toPolyline();
    const arc = FittingAlgo.fitArc(pnts);

    expect(arc.p0[0]).toBeCloseTo(0);
    expect(arc.p0[1]).toBeCloseTo(0);
    expect(arc.p1[0]).toBeCloseTo(1);
    expect(arc.p1[1]).toBeCloseTo(1);

    expect(arc.bulge).toBeCloseTo(1);
  });

  test('00 -> 11, -1', () => {
    const pnts: number[][] = new Arc([0, 0], [1, 1], -1).toPolyline();
    const arc = FittingAlgo.fitArc(pnts);

    expect(arc.p0[0]).toBeCloseTo(0);
    expect(arc.p0[1]).toBeCloseTo(0);
    expect(arc.p1[0]).toBeCloseTo(1);
    expect(arc.p1[1]).toBeCloseTo(1);

    expect(arc.bulge).toBeCloseTo(-1);
  });

  test('10 -> 20, 1', () => {
    const pnts: number[][] = new Arc([1, 0], [2, 0], 1).toPolyline();
    const arc = FittingAlgo.fitArc(pnts);

    expect(arc.p0[0]).toBeCloseTo(1);
    expect(arc.p0[1]).toBeCloseTo(0);
    expect(arc.p1[0]).toBeCloseTo(2);
    expect(arc.p1[1]).toBeCloseTo(0);

    expect(arc.bulge).toBeCloseTo(1);
  });
});

describe('FittingAlgo', () => {
  it('line -> line', () => {
    const pnts: number[][] = [
      [0, 0],
      [1, 0],
      [1, 1],
    ];
    const wire = new FittingAlgo(pnts).run();
    const desc = _descWire(wire);

    expect(desc).toEqual([
      ['line', [0, 0, 1, 0]],
      ['line', [1, 0, 1, 1]],
    ]);
  });

  it('line -> arc', () => {
    const pnts: number[][] = [[0, 0], [1, 0], ...new Arc([1, 0], [2, 0], 1).toPolyline()];
    const wire = new FittingAlgo(pnts).run();
    const desc = _descWire(wire);

    expect(desc).toEqual([
      ['line', [0, 0, 1, 0]],
      ['arc', [1, 0, 1.5, -0.5, 2, 0]],
    ]);
  });
});
