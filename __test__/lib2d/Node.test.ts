import { Node } from '../../src/lib2d/Node';
import { Line } from '../../src/lib2d/Line';

describe('Node', () => {
  it('applyTransform', () => {
    const node = new Node(new Line([0, 0], [1, 0]));

    node.position = [1, 1];
    node.rotation = Math.PI / 2;
    node.scaling = [2, 2];

    const oldPos = [...node.position];
    const oldRot = node.rotation;
    const oldSca = [...node.scaling];

    node.applyTransform();

    expect(node.position[0]).toBe(0);
    expect(node.position[1]).toBe(0);
    expect(node.rotation).toBe(0);
    expect(node.scaling[0]).toBe(1);
    expect(node.scaling[1]).toBe(1);

    expect(node.primitive.p0[0]).toBeCloseTo(1);
    expect(node.primitive.p0[1]).toBeCloseTo(1);
    expect(node.primitive.p1[0]).toBeCloseTo(1);
    expect(node.primitive.p1[1]).toBeCloseTo(3);

    // inverse
    node.alineTo(oldPos, oldRot, oldSca);

    expect(node.position[0]).toBe(oldPos[0]);
    expect(node.position[1]).toBe(oldPos[1]);
    expect(node.rotation).toBe(oldRot);
    expect(node.scaling[0]).toBe(oldSca[0]);
    expect(node.scaling[1]).toBe(oldSca[1]);

    expect(node.primitive.p0[0]).toBeCloseTo(0);
    expect(node.primitive.p0[1]).toBeCloseTo(0);
    expect(node.primitive.p1[0]).toBeCloseTo(1);
    expect(node.primitive.p1[1]).toBeCloseTo(0);
  });

  it('matrix', () => {
    const node = new Node(null);

    node.position = [1, 1];
    node.rotation = Math.PI / 2;
    node.scaling = [2, 2];

    const m = node.matrix();

    expect(m[0]).toBeCloseTo(0);
    expect(m[1]).toBeCloseTo(2);
    expect(m[2]).toBeCloseTo(0);
    expect(m[3]).toBeCloseTo(-2);
    expect(m[4]).toBeCloseTo(0);
    expect(m[5]).toBeCloseTo(0);
    expect(m[6]).toBeCloseTo(1);
    expect(m[7]).toBeCloseTo(1);
    expect(m[8]).toBeCloseTo(1);
  });

  it('hierarchy', () => {
    const node0 = new Node(new Line([0, 0], [1, 0]), [1, 2]);
    const node1 = new Node(new Line([0, 0], [1, 0]), [0, 1], Math.PI / 2, [2, 2]);
    node1.setParent(node0);

    const nodeT = node1.applyTransform();

    expect(nodeT.primitive.p0[0]).toBeCloseTo(1);
    expect(nodeT.primitive.p0[1]).toBeCloseTo(3);
    expect(nodeT.primitive.p1[0]).toBeCloseTo(1);
    expect(nodeT.primitive.p1[1]).toBeCloseTo(5);
  });
});
