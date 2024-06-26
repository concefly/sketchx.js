export class Hierarchy {
  parent: this | null = null;
  children: this[] = [];

  traverse(callback: (node: this, parent?: this) => any) {
    callback(this);
    this.children.forEach(child => child.traverse(callback));
  }

  add(node: this | this[]): this {
    if (Array.isArray(node)) {
      node.forEach(n => this.add(n));
      return this;
    }

    if (this.children.includes(node)) return this;

    if (node.parent) node.parent.remove(node);
    node.parent = this;

    this.children.push(node);

    return this;
  }

  /**
   * Removes a child node from the current node.
   *
   * @param node - The child node to be removed.
   */
  remove(node: this) {
    const index = this.children.indexOf(node);

    if (index !== -1) {
      this.children.splice(index, 1);
      node.removeFormParent();
    }
  }

  /**
   * Clears the children of the node.
   */
  clear() {
    for (const child of this.children) {
      child.removeFormParent();
    }

    this.children = [];
  }

  /**
   * Removes the node from its parent.
   */
  removeFormParent() {
    if (this.parent) this.parent.remove(this);
    this.parent = null;
  }

  /**
   * Sets the parent of the node.
   * If the node already has a parent, it will be removed from the current parent before being added to the new parent.
   * @param parent - The new parent node.
   */
  setParent(parent: this | null) {
    if (this.parent) this.parent.remove(this);
    parent?.add(this);
  }
}
