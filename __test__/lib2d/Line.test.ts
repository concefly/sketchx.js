import { MatrixUtil } from '../../src/MatrixUtil';
import { Line } from '../../src/lib2d/Line';

describe('Line', () => {
  let line: Line;

  beforeEach(() => {
    const p0: number[] = [0, 0];
    const p1: number[] = [1, 1];
    line = new Line(p0, p1);
  });

  it('should create a Line instance', () => {
    expect(line).toBeInstanceOf(Line);
  });

  it('should calculate the geometric center of the line', () => {
    const geoCenter = line.geoCenter;
    expect(geoCenter).toEqual([0.5, 0.5]);
  });

  it('should calculate the length of the line', () => {
    const length = line.length;
    expect(length).toBeCloseTo(Math.sqrt(2), 5);
  });

  it('should check if the line is closed', () => {
    const isClosed = line.isClosed();
    expect(isClosed).toBe(false);
  });

  it('should calculate a point on the line at a given parameter', () => {
    const t = 0.5 * line.length;
    const ref: number[] = [];
    const point = line.pointAt(t, ref);
    expect(point).toEqual([0.5, 0.5]);
  });

  it('should calculate the tangent vector at a given parameter', () => {
    const t = 0.5;
    const ref: number[] = [];
    const tangent = line.tangentAt(t, ref);
    expect(tangent).toEqual([0.7071067811865475, 0.7071067811865475]);
  });

  it('should return the points of the line', () => {
    const points = line.toPolyline();
    expect(points).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  it('extend to length', () => {
    const line = new Line([0, 0], [1, 0]);
    line.extend(1);
    expect(line.p1).toEqual([2, 0]);
  });

  it('extend to pnt - inline', () => {
    const line = new Line([0, 0], [1, 0]);
    line.extend([2, 0]);
    expect(line.p1).toEqual([2, 0]);
  });

  it('extend to pnt - not inline', () => {
    const line = new Line([0, 0], [1, 0]);
    line.extend([2, 1]);
    expect(line.p1).toEqual([2, 0]);
  });

  it('extend to curve - line', () => {
    const line = new Line([0, 0], [1, 0]);
    const line2 = new Line([2, -1], [2, 1]);

    line.extend(line2);
    expect(line.p1).toEqual([2, 0]);
  });

  it('extend to curve - line 2', () => {
    const line = new Line([0, 0], [1, 0]);
    const line2 = new Line([2, 1], [2, 2]);

    line.extend(line2);
    expect(line.p1).toEqual([1, 0]);
  });

  it('applyMatrix', () => {
    const line = new Line([0, 0], [1, 0]);

    const mat = MatrixUtil.identify([]);
    MatrixUtil.makeRotation(Math.PI / 2, mat);

    line.applyMatrix(mat);

    expect(line.p0[0]).toBeCloseTo(0);
    expect(line.p0[1]).toBeCloseTo(0);
    expect(line.p1[0]).toBeCloseTo(0);
    expect(line.p1[1]).toBeCloseTo(1);
  });
});
