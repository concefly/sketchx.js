import { Vector2 } from 'three';
import { Node } from '../../src/lib2d/Node';
import { Line } from '../../src/lib2d/Line';

describe('Node', () => {
  it('applyTransform', () => {
    const node = new Node(new Line(new Vector2(0, 0), new Vector2(1, 0)));

    node.position = { x: 1, y: 1 };
    node.rotation = Math.PI / 2;
    node.scaling = { x: 2, y: 2 };

    const oldPos = { ...node.position };
    const oldRot = node.rotation;
    const oldSca = { ...node.scaling };

    node.applyTransform();

    expect(node.position.x).toBe(0);
    expect(node.position.y).toBe(0);
    expect(node.rotation).toBe(0);
    expect(node.scaling.x).toBe(1);
    expect(node.scaling.y).toBe(1);

    expect(node.primitive.p0.x).toBeCloseTo(1);
    expect(node.primitive.p0.y).toBeCloseTo(1);
    expect(node.primitive.p1.x).toBeCloseTo(1);
    expect(node.primitive.p1.y).toBeCloseTo(3);

    // inverse
    node.alineTo(oldPos, oldRot, oldSca);

    expect(node.position.x).toBe(oldPos.x);
    expect(node.position.y).toBe(oldPos.y);
    expect(node.rotation).toBe(oldRot);
    expect(node.scaling.x).toBe(oldSca.x);
    expect(node.scaling.y).toBe(oldSca.y);

    expect(node.primitive.p0.x).toBeCloseTo(0);
    expect(node.primitive.p0.y).toBeCloseTo(0);
    expect(node.primitive.p1.x).toBeCloseTo(1);
    expect(node.primitive.p1.y).toBeCloseTo(0);
  });

  it('matrix', () => {
    const node = new Node(new Line(new Vector2(0, 0), new Vector2(1, 0)));

    node.position = { x: 1, y: 1 };
    node.rotation = Math.PI / 2;
    node.scaling = { x: 2, y: 2 };

    const m = node.matrix();

    expect(m.elements[0]).toBeCloseTo(0);
    expect(m.elements[1]).toBeCloseTo(2);
    expect(m.elements[2]).toBeCloseTo(0);
    expect(m.elements[3]).toBeCloseTo(-2);
    expect(m.elements[4]).toBeCloseTo(0);
    expect(m.elements[5]).toBeCloseTo(0);
    expect(m.elements[6]).toBeCloseTo(1);
    expect(m.elements[7]).toBeCloseTo(1);
    expect(m.elements[8]).toBeCloseTo(1);
  });

  it('hierarchy', () => {
    const node0 = new Node(new Line(new Vector2(0, 0), new Vector2(1, 0)), new Vector2(1, 2));
    const node1 = new Node(new Line(new Vector2(0, 0), new Vector2(1, 0)), new Vector2(0, 1), Math.PI / 2, new Vector2(2, 2));
    node1.setParent(node0);

    const nodeT = node1.applyTransform();

    expect(nodeT.primitive.p0.x).toBeCloseTo(1);
    expect(nodeT.primitive.p0.y).toBeCloseTo(3);
    expect(nodeT.primitive.p1.x).toBeCloseTo(1);
    expect(nodeT.primitive.p1.y).toBeCloseTo(5);
  });
});
