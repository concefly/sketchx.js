import { randomID } from '../randomID';
import { Hierarchy } from '../Hierarchy';
import { BaseTopo } from './Topo/BaseTopo';
import { Mat4Util } from '../Mat4Util';

export class Node3d extends Hierarchy {
  constructor(
    public primitive: BaseTopo | null = null,
    public position = [0, 0, 0],
    public rotation = [0, 0, 0],
    public scaling = [1, 1, 1]
  ) {
    super();
  }

  private __localMatrix = Mat4Util.identity([]);
  private __worldMatrix = Mat4Util.identity([]);

  id = randomID();

  matrix() {
    const m = this.__localMatrix;
    Mat4Util.compose(this.position, this.rotation, this.scaling, m);
    return m;
  }

  worldMatrix() {
    if (this.parent) {
      // this.__worldMatrix.multiplyMatrices(this.parent.worldMatrix(), this.matrix());
      Mat4Util.multiply(this.parent.worldMatrix(), this.matrix(), this.__worldMatrix);
    } else {
      Mat4Util.copy(this.matrix(), this.__worldMatrix);
    }

    return this.__worldMatrix;
  }

  applyTransform() {
    const m = this.worldMatrix();

    this.position[0] = 0;
    this.position[1] = 0;
    this.position[2] = 0;

    this.rotation[0] = 0;
    this.rotation[1] = 0;
    this.rotation[2] = 0;

    this.scaling[0] = 1;
    this.scaling[1] = 1;
    this.scaling[2] = 1;

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
