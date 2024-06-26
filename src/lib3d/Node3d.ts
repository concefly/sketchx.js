import { randomID } from '../randomID';
import { Hierarchy } from '../Hierarchy';
import { Euler, Matrix4, Vector3 } from 'three';
import { BaseTopo } from './Topo/BaseTopo';

export class Node3d extends Hierarchy {
  constructor(
    public primitive: BaseTopo | null = null,
    public position = new Vector3(),
    public rotation = new Euler(),
    public scaling = new Vector3(1, 1)
  ) {
    super();
  }

  private __localMatrix = new Matrix4();
  private __worldMatrix = new Matrix4();

  id = randomID();

  matrix() {
    const m = this.__localMatrix.identity();

    m.makeRotationFromEuler(this.rotation);
    m.setPosition(this.position);
    m.scale(this.scaling);

    return m;
  }

  worldMatrix() {
    if (this.parent) {
      this.__worldMatrix.multiplyMatrices(this.parent.worldMatrix(), this.matrix());
    } else {
      this.__worldMatrix.copy(this.matrix());
    }

    return this.__worldMatrix;
  }

  applyTransform() {
    const m = this.worldMatrix();
    // this.primitive?.applyMatrix(m);

    this.position.set(0, 0, 0);
    this.rotation.set(0, 0, 0);
    this.scaling.set(1, 1, 1);

    return this;
  }

  find(id: string): Node3d | null {
    if (this.id === id) return this;

    for (const child of this.children) {
      const node = child.find(id);
      if (node) return node;
    }

    return null;
  }
}
