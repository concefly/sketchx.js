import { Vector2 } from 'three';
import { Circle } from '../../src/lib2d/Circle';

describe('Circle', () => {
  let circle: Circle;
  const center = new Vector2(0, 0);
  const radius = 5;

  beforeEach(() => {
    circle = new Circle(center.clone(), radius);
  });

  it('constructor initializes correctly', () => {
    expect(circle.center).toEqual(center);
    expect(circle.radius).toBe(radius);
  });

  it('length returns correct circumference', () => {
    expect(circle.length).toBeCloseTo(2 * Math.PI * radius);
  });

  it('geoCenter returns correct center', () => {
    expect(circle.geoCenter).toEqual(center);
  });

  it('isClosed returns true', () => {
    expect(circle.isClosed()).toBe(true);
  });

  it('pointAt returns correct point on circle', () => {
    const ref = new Vector2();
    const point = circle.pointAt(0.25 * circle.length, ref); // 90 degrees

    expect(point.x).toBeCloseTo(0);
    expect(point.y).toBeCloseTo(radius);
  });

  it('tangentAt returns correct tangent vector', () => {
    const ref = new Vector2();
    const tangent = circle.tangentAt(0.25 * circle.length, ref); // 90 degrees
    expect(tangent.x).toBeCloseTo(-radius);
    expect(tangent.y).toBeCloseTo(0);
  });

  it('getPoints returns correct points on circle', () => {
    const points = circle.toPolyline();
    expect(points.length).toBe(361);
    expect(points[0]).toEqual(new Vector2(radius, 0));
  });

  it('clone creates an identical circle', () => {
    const clone = circle.clone();
    expect(clone.center).toEqual(circle.center);
    expect(clone.radius).toBe(circle.radius);
  });

  it('toJSON and fromJSON work correctly', () => {
    const json = circle.toJSON();
    const newCircle = new Circle(new Vector2(), 0).fromJSON(json);
    expect(newCircle.center).toEqual(circle.center);
    expect(newCircle.radius).toBe(circle.radius);
  });
});
