import { Vector2 } from 'three';
import { Arc } from '../../src/lib2d/Arc';

describe('Arc', () => {
  let arc: Arc;
  const p0 = new Vector2(0, 0);
  const p1 = new Vector2(1, 1);
  const bulge = 1; // 180 degrees, counter-clockwise

  beforeEach(() => {
    arc = new Arc(p0.clone(), p1.clone(), bulge);
  });

  test('constructor initializes correctly', () => {
    expect(arc.p0).toEqual(p0);
    expect(arc.p1).toEqual(p1);
    expect(arc.bulge).toBe(bulge);
  });

  test('getCenter calculates correct center', () => {
    const center = arc.getCenter(new Vector2());
    expect(center.x).toBeCloseTo(0.5);
    expect(center.y).toBeCloseTo(0.5);
  });

  test('sita returns correct sita', () => {
    const sita = arc.getSita();
    expect(sita).toBeCloseTo(Math.PI);
  });

  test('radius returns correct radius', () => {
    const radius = arc.getRadius();
    expect(radius).toBeCloseTo(Math.sqrt(2) / 2);
  });

  test('clockWise returns false', () => {
    expect(arc.clockWise).toBe(false);
  });

  test('length returns correct length', () => {
    const length = arc.length;
    expect(length).toBeCloseTo((Math.PI * Math.sqrt(2)) / 2);
  });

  test('length2', () => {
    arc = new Arc(new Vector2(1, 0), new Vector2(0, 0), -1);
    const length = arc.length;
    expect(length).toBeCloseTo(Math.PI / 2);
  });

  test('geoCenter returns correct center', () => {
    const geoCenter = arc.geoCenter;
    expect(geoCenter).toEqual(new Vector2(0.5, 0.5));
  });

  test('isClosed returns false', () => {
    expect(arc.isClosed()).toBe(false);
  });

  test('pointAt returns correct point on arc', () => {
    arc.p1.set(0, 1);

    // 0% - 50% - 100% of the arc
    const [point0, point50, point100] = [
      arc.pointAt(0 * arc.length, new Vector2()),
      arc.pointAt(0.5 * arc.length, new Vector2()),
      arc.pointAt(1 * arc.length, new Vector2()),
    ];

    expect(point0.x).toBeCloseTo(0);
    expect(point0.y).toBeCloseTo(0);
    expect(point50.x).toBeCloseTo(0.5);
    expect(point50.y).toBeCloseTo(0.5);
    expect(point100.x).toBeCloseTo(0);
    expect(point100.y).toBeCloseTo(1);
  });

  test('tangentAt returns correct tangent vector', () => {
    arc.p1.set(0, 1);

    // 0% - 50% - 100% of the arc
    const [tangent0, tangent50, tangent100] = [
      arc.tangentAt(0 * arc.length, new Vector2()),
      arc.tangentAt(0.5 * arc.length, new Vector2()),
      arc.tangentAt(1 * arc.length, new Vector2()),
    ];

    expect(tangent0.x).toBeCloseTo(1);
    expect(tangent0.y).toBeCloseTo(0);

    expect(tangent50.x).toBeCloseTo(0);
    expect(tangent50.y).toBeCloseTo(1);

    expect(tangent100.x).toBeCloseTo(-1);
    expect(tangent100.y).toBeCloseTo(0);
  });

  test('clone creates an identical arc', () => {
    const clone = arc.clone();
    expect(clone.p0).toEqual(arc.p0);
    expect(clone.p1).toEqual(arc.p1);
    expect(clone.bulge).toBe(arc.bulge);
  });

  test('toJSON and fromJSON work correctly', () => {
    const json = arc.toJSON();
    const newArc = new Arc(new Vector2(), new Vector2(), 0).fromJSON(json);
    expect(newArc.p0).toEqual(arc.p0);
    expect(newArc.p1).toEqual(arc.p1);
    expect(newArc.bulge).toBe(arc.bulge);
  });
});
