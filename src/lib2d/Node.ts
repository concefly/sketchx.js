import { Vec2, Matrix3, Vector3 } from 'three';
import { INodeData } from './2d.type';
import { Curve } from './Curve';
import { Parser } from './Parser';
import { Face } from './Face';
import { randomID } from '../randomID';
import { Hierarchy } from '../Hierarchy';
import { VecUtil } from '../VecUtil';

/**
 * Node 类表示一个节点，它包含一个 primitive 对象，primitive 可以是 Curve 或 Face。
 *
 * - Node 会引入 local 坐标系，它的 position、rotation、scaling 属性表示相对于上级（现在是世界）坐标系的变换。
 */
export class Node<T extends Curve | Face | null = Curve | Face | null, D = any> extends Hierarchy {
  constructor(
    public primitive: T,
    public position = { x: 0, y: 0 },
    public rotation = 0,
    public scaling = { x: 1, y: 1 }
  ) {
    super();
  }

  id = randomID();
  userData?: D;

  private __localMatrix = new Matrix3();
  private __worldMatrix = new Matrix3();

  /** 对齐到指定姿态，并保持 primitive 世界位姿不变 */
  alineTo(node: Node): this;
  alineTo(position: Vec2, rotation?: number, scaling?: Vec2): this;
  alineTo(posOrNode: Node | Vec2, rotation?: number, scaling?: Vec2) {
    if (posOrNode instanceof Node) return this.alineTo(posOrNode.position, posOrNode.rotation, posOrNode.scaling);

    const position = posOrNode;
    rotation = rotation ?? 0;
    scaling = scaling ?? { x: 1, y: 1 };

    this.position.x = position.x;
    this.position.y = position.y;

    this.rotation = rotation;

    this.scaling.x = scaling.x;
    this.scaling.y = scaling.y;

    // 逆变换
    if (this.primitive) {
      const mInv = new Matrix3();

      mInv.makeRotation(rotation);
      mInv.scale(scaling.x, scaling.y);
      mInv.translate(position.x, position.y);

      mInv.invert();

      this.primitive.applyMatrix(mInv);
    }

    return this;
  }

  applyTransform() {
    const m = this.worldMatrix();
    this.primitive?.applyMatrix(m);

    this.position.x = 0;
    this.position.y = 0;

    this.rotation = 0;

    this.scaling.x = 1;
    this.scaling.y = 1;

    return this;
  }

  /**
   * Returns the transformation matrix for this node.
   * The matrix is computed based on the node's rotation, scaling, and position.
   *
   * @returns The transformation matrix.
   */
  matrix() {
    const m = this.__localMatrix.identity();

    m.makeRotation(this.rotation);
    m.scale(this.scaling.x, this.scaling.y);
    m.translate(this.position.x, this.position.y);

    return m;
  }

  /**
   * Returns the world transformation matrix for this node.
   * The matrix is computed based on the node's rotation, scaling, and position, as well as the parent nodes.
   *
   * @returns The world transformation matrix.
   */
  worldMatrix() {
    this.__worldMatrix.copy(this.matrix());

    const m = this.__worldMatrix;
    let node = this.parent;

    while (node) {
      m.premultiply(node.matrix());
      node = node.parent;
    }

    return m;
  }

  worldToLocal(pnt: Vec2): Vec2 {
    const m = this.worldMatrix().clone().invert();

    return VecUtil.applyMatrix3(pnt, m, { x: 0, y: 0 });
  }

  worldPosition(): Vec2 {
    return VecUtil.applyMatrix3({ x: 0, y: 0 }, this.worldMatrix(), { x: 0, y: 0 });
  }

  localToWorld(pnt: Vec2): Vec2 {
    return VecUtil.applyMatrix3(pnt, this.worldMatrix(), { x: 0, y: 0 });
  }

  clone(opt: { withParent?: boolean; noChildren?: boolean } = {}): this {
    const cloned = new Node(this.primitive?.clone() || null, { ...this.position }, this.rotation, { ...this.scaling });
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
      position: [this.position.x, this.position.y],
      rotation: this.rotation,
      scaling: [this.scaling.x, this.scaling.y],
      children: this.children.map(child => child.toJSON()),
      userData: this.userData,
    };
  }

  fromJSON(data: INodeData): this {
    this.id = data.id;
    this.primitive = (data.primitive ? Parser.parse(data.primitive) : null) as T;

    this.position.x = data.position[0];
    this.position.y = data.position[1];

    this.rotation = data.rotation;

    this.scaling.x = data.scaling[0];
    this.scaling.y = data.scaling[1];

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
