import { INodeData } from './2d.type';
import { Curve } from './Curve';
import { Parser } from './Parser';
import { Face } from './Face';
import { randomID } from '../randomID';
import { Hierarchy } from '../Hierarchy';
import { Vec2Util } from '../Vec2Util';
import { Mat3Util } from '../Mat3Util';
import { IMat3, IVec2 } from '../typing';

/**
 * Node 类表示一个节点，它包含一个 primitive 对象，primitive 可以是 Curve 或 Face。
 *
 * - Node 会引入 local 坐标系，它的 position、rotation、scaling 属性表示相对于上级（现在是世界）坐标系的变换。
 */
export class Node<T extends Curve | Face | null = Curve | Face | null, D = any> extends Hierarchy {
  constructor(
    public primitive: T,
    public position = [0, 0],
    public rotation = 0,
    public scaling = [1, 1]
  ) {
    super();
  }

  id = randomID();
  userData?: D;

  private __localMatrix = Mat3Util.identify([]);
  private __worldMatrix = Mat3Util.identify([]);

  /** 对齐到指定姿态，并保持 primitive 世界位姿不变 */
  alineTo(node: Node): this;
  alineTo(position: IVec2, rotation?: number, scaling?: IVec2): this;
  alineTo(posOrNode: Node | IVec2, rotation?: number, scaling?: IVec2) {
    if (posOrNode instanceof Node) return this.alineTo(posOrNode.position, posOrNode.rotation, posOrNode.scaling);

    const position = posOrNode;
    rotation = rotation ?? 0;
    scaling = scaling ?? [1, 1];

    this.position[0] = position[0];
    this.position[1] = position[1];

    this.rotation = rotation;

    this.scaling[0] = scaling[0];
    this.scaling[1] = scaling[1];

    // 逆变换
    if (this.primitive) {
      const mInv = Mat3Util.identify([]);

      Mat3Util.compose(position, rotation, scaling, mInv);
      Mat3Util.invert(mInv, mInv);

      this.primitive.applyMatrix(mInv);
    }

    return this;
  }

  /**
   * Applies the transformation to the node.
   * This method calculates the world matrix, **removes the node from its parent**
   */
  applyTransform() {
    const m = this.worldMatrix();

    this.removeFormParent();
    this.setWorldPose(m);

    return this;
  }

  /**
   * Returns the transformation matrix for this node.
   * The matrix is computed based on the node's rotation, scaling, and position.
   *
   * @returns The transformation matrix.
   */
  matrix() {
    const m = Mat3Util.identify(this.__localMatrix);
    Mat3Util.compose(this.position, this.rotation, this.scaling, m);
    return m;
  }

  /**
   * Returns the world transformation matrix for this node.
   * The matrix is computed based on the node's rotation, scaling, and position, as well as the parent nodes.
   *
   * @returns The world transformation matrix.
   */
  worldMatrix() {
    Mat3Util.copy(this.matrix(), this.__worldMatrix);

    const m = this.__worldMatrix;
    let node = this.parent;

    while (node) {
      Mat3Util.multiply(node.matrix(), m, m);
      node = node.parent;
    }

    return m;
  }

  /**
   * Sets the world pose of the node using the specified world matrix.
   *
   * @param worldMatrix - The world matrix representing the new pose of the node.
   */
  setWorldPose(worldMatrix: IMat3) {
    const parentInv = Mat3Util.identify([]);
    Mat3Util.invert(this.parent?.worldMatrix() || Mat3Util.identify([]), parentInv);

    const newLocal = Mat3Util.multiply(parentInv, worldMatrix, []);

    this.position = Mat3Util.getTranslation(newLocal);
    this.rotation = Mat3Util.getRotation(newLocal);
    this.scaling = Mat3Util.getScaling(newLocal);
  }

  worldToLocal(pnt: IVec2): IVec2 {
    const m = Mat3Util.identify([]);
    Mat3Util.invert(this.worldMatrix(), m);

    return Vec2Util.applyMatrix(pnt, m, []);
  }

  worldPosition(): IVec2 {
    return Vec2Util.applyMatrix([], this.worldMatrix(), []);
  }

  localToWorld(pnt: IVec2): IVec2 {
    return Vec2Util.applyMatrix(pnt, this.worldMatrix(), []);
  }

  clone(opt: { withParent?: boolean; noChildren?: boolean } = {}): this {
    const cloned = new Node(this.primitive?.clone() || null, this.position.slice(), this.rotation, this.scaling.slice());
    cloned.userData = structuredClone(this.userData);

    if (opt.withParent) {
      cloned.setParent(this.parent);
    }

    if (!opt.noChildren) {
      cloned.add(this.children.map(child => child.clone()));
    }

    return cloned as any;
  }

  toJSON(): INodeData<D> {
    return {
      type: 'node',
      id: this.id,
      primitive: this.primitive?.toJSON(),
      position: [...this.position],
      rotation: this.rotation,
      scaling: [...this.scaling],
      children: this.children.map(child => child.toJSON()),
      userData: this.userData,
    };
  }

  fromJSON(data: INodeData): this {
    this.id = data.id;
    this.primitive = (data.primitive ? Parser.parse(data.primitive) : null) as T;

    Vec2Util.copy(data.position, this.position);
    this.rotation = data.rotation;
    Vec2Util.copy(data.scaling, this.scaling);

    if (data.children) {
      this.add(data.children.map(Parser.parse) as any);
    }

    if (typeof data.userData !== 'undefined') {
      this.userData = data.userData;
    }

    return this;
  }

  find(id: string): Node | null {
    if (this.id === id) return this;

    for (const child of this.children) {
      const node = child.find(id);
      if (node) return node;
    }

    return null;
  }
}
