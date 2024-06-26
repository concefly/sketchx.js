import { Matrix3, Vector2 } from 'three';
import { Line } from '../../src/lib2d/Line';

describe('Line', () => {
  let line: Line;

  beforeEach(() => {
    const p0 = new Vector2(0, 0);
    const p1 = new Vector2(1, 1);
    line = new Line(p0, p1);
  });

  it('should create a Line instance', () => {
    expect(line).toBeInstanceOf(Line);
  });

  it('should calculate the geometric center of the line', () => {
    const geoCenter = line.geoCenter;
    expect(geoCenter).toEqual(new Vector2(0.5, 0.5));
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
    const ref = new Vector2();
    const point = line.pointAt(t, ref);
    expect(point).toEqual(new Vector2(0.5, 0.5));
  });

  it('should calculate the tangent vector at a given parameter', () => {
    const t = 0.5;
    const ref = new Vector2();
    const tangent = line.tangentAt(t, ref);
    expect(tangent).toEqual(new Vector2(1, 1).normalize());
  });

  it('should return the points of the line', () => {
    const points = line.toPolyline();
    expect(points).toEqual([new Vector2(0, 0), new Vector2(1, 1)]);
  });

  it('extend to length', () => {
    const line = new Line(new Vector2(0, 0), new Vector2(1, 0));
    line.extend(1);
    expect(line.p1).toEqual(new Vector2(2, 0));
  });

  it('extend to pnt - inline', () => {
    const line = new Line(new Vector2(0, 0), new Vector2(1, 0));
    line.extend(new Vector2(2, 0));
    expect(line.p1).toEqual(new Vector2(2, 0));
  });

  it('extend to pnt - not inline', () => {
    const line = new Line(new Vector2(0, 0), new Vector2(1, 0));
    line.extend(new Vector2(2, 1));
    expect(line.p1).toEqual(new Vector2(2, 0));
  });

  it('extend to curve - line', () => {
    const line = new Line(new Vector2(0, 0), new Vector2(1, 0));
    const line2 = new Line(new Vector2(2, -1), new Vector2(2, 1));

    line.extend(line2);
    expect(line.p1).toEqual(new Vector2(2, 0));
  });

  it('extend to curve - line 2', () => {
    const line = new Line(new Vector2(0, 0), new Vector2(1, 0));
    const line2 = new Line(new Vector2(2, 1), new Vector2(2, 2));

    line.extend(line2);
    expect(line.p1).toEqual(new Vector2(1, 0));
  });

  it('applyMatrix', () => {
    const line = new Line(new Vector2(0, 0), new Vector2(1, 0));
    line.applyMatrix(new Matrix3().makeRotation(Math.PI / 2));

    expect(line.p0.x).toBeCloseTo(0);
    expect(line.p0.y).toBeCloseTo(0);
    expect(line.p1.x).toBeCloseTo(0);
    expect(line.p1.y).toBeCloseTo(1);
  });
});
