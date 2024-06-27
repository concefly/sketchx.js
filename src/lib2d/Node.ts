import { INodeData } from './2d.type';
import { Curve } from './Curve';
import { Parser } from './Parser';
import { Face } from './Face';
import { randomID } from '../randomID';
import { Hierarchy } from '../Hierarchy';
import { VecUtil } from '../VecUtil';
import { MatrixUtil } from '../MatrixUtil';
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

  private __localMatrix = MatrixUtil.identify([]);
  private __worldMatrix = MatrixUtil.identify([]);

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
      const mInv = MatrixUtil.identify([]);

      MatrixUtil.compose(position, rotation, scaling, mInv);
      MatrixUtil.invert(mInv, mInv);

      this.primitive.applyMatrix(mInv);
    }

    return this;
  }

  applyTransform() {
    const m = this.worldMatrix();
    this.primitive?.applyMatrix(m);

    this.position[0] = 0;
    this.position[1] = 0;

    this.rotation = 0;

    this.scaling[0] = 1;
    this.scaling[1] = 1;

    return this;
  }

  /**
   * Returns the transformation matrix for this node.
   * The matrix is computed based on the node's rotation, scaling, and position.
   *
   * @returns The transformation matrix.
   */
  matrix() {
    const m = MatrixUtil.identify(this.__localMatrix);
    MatrixUtil.compose(this.position, this.rotation, this.scaling, m);
    return m;
  }

  /**
   * Returns the world transformation matrix for this node.
   * The matrix is computed based on the node's rotation, scaling, and position, as well as the parent nodes.
   *
   * @returns The world transformation matrix.
   */
  worldMatrix() {
    MatrixUtil.copy(this.matrix(), this.__worldMatrix);

    const m = this.__worldMatrix;
    let node = this.parent;

    while (node) {
      MatrixUtil.multiply(node.matrix(), m, m);
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
    const parentInv = MatrixUtil.identify([]);
    MatrixUtil.invert(this.parent?.worldMatrix() || MatrixUtil.identify([]), parentInv);

    const newLocal = MatrixUtil.multiply(parentInv, worldMatrix, []);

    this.position = MatrixUtil.getTranslation(newLocal);
    this.rotation = MatrixUtil.getRotation(newLocal);
    this.scaling = MatrixUtil.getScaling(newLocal);
  }

  worldToLocal(pnt: IVec2): IVec2 {
    const m = MatrixUtil.identify([]);
    MatrixUtil.invert(this.worldMatrix(), m);

    return VecUtil.applyMatrix(pnt, m, []);
  }

  worldPosition(): IVec2 {
    return VecUtil.applyMatrix([], this.worldMatrix(), []);
  }

  localToWorld(pnt: IVec2): IVec2 {
    return VecUtil.applyMatrix(pnt, this.worldMatrix(), []);
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

    VecUtil.copy(data.position, this.position);
    this.rotation = data.rotation;
    VecUtil.copy(data.scaling, this.scaling);

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
