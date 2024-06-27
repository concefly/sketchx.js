import { IMat3, IVec2 } from './typing';

/**
 * 矩阵工具类
 *
 * - IMat3 是一个 3x3 的矩阵，它的排列方式是列优先的。
 */
export const MatrixUtil = {
  copy(m: IMat3, ref: IMat3) {
    ref[0] = m[0];
    ref[1] = m[1];
    ref[2] = m[2];
    ref[3] = m[3];
    ref[4] = m[4];
    ref[5] = m[5];
    ref[6] = m[6];
    ref[7] = m[7];
    ref[8] = m[8];

    return ref;
  },

  invert(m: IMat3, ref: IMat3) {
    const n11 = m[0],
      n21 = m[1],
      n31 = m[2];
    const n12 = m[3],
      n22 = m[4],
      n32 = m[5];
    const n13 = m[6],
      n23 = m[7],
      n33 = m[8];

    const t11 = n33 * n22 - n32 * n23;
    const t12 = n32 * n13 - n33 * n12;
    const t13 = n23 * n12 - n22 * n13;

    const det = n11 * t11 + n21 * t12 + n31 * t13;

    if (det === 0) {
      ref[0] = 0;
      ref[1] = 0;
      ref[2] = 0;
      ref[3] = 0;
      ref[4] = 0;
      ref[5] = 0;
      ref[6] = 0;
      ref[7] = 0;
      ref[8] = 0;
      return ref;
    }

    const detInv = 1 / det;

    ref[0] = t11 * detInv;
    ref[1] = (n31 * n23 - n33 * n21) * detInv;
    ref[2] = (n32 * n21 - n31 * n22) * detInv;

    ref[3] = t12 * detInv;
    ref[4] = (n33 * n11 - n31 * n13) * detInv;
    ref[5] = (n31 * n12 - n32 * n11) * detInv;

    ref[6] = t13 * detInv;
    ref[7] = (n21 * n13 - n23 * n11) * detInv;
    ref[8] = (n22 * n11 - n21 * n12) * detInv;

    return ref;
  },

  identify(ref: IMat3) {
    ref[0] = 1;
    ref[1] = 0;
    ref[2] = 0;
    ref[3] = 0;
    ref[4] = 1;
    ref[5] = 0;
    ref[6] = 0;
    ref[7] = 0;
    ref[8] = 1;

    return ref;
  },

  makeRotation(angle: number, ref: IMat3) {
    return this.compose([0, 0], angle, [1, 1], ref);
  },

  makeScaling(sx: number, sy: number, ref: IMat3) {
    return this.compose([0, 0], 0, [sx, sy], ref);
  },

  makeTranslation(tx: number, ty: number, ref: IMat3) {
    return this.compose([tx, ty], 0, [1, 1], ref);
  },

  compose(position: IVec2, rotation: number, scaling: IVec2, ref: IMat3) {
    const c = Math.cos(rotation);
    const s = Math.sin(rotation);

    ref[0] = c * scaling[0];
    ref[1] = s * scaling[0];
    ref[2] = 0;
    ref[3] = -s * scaling[1];
    ref[4] = c * scaling[1];
    ref[5] = 0;
    ref[6] = position[0];
    ref[7] = position[1];
    ref[8] = 1;

    return ref;
  },

  multiply(a: IMat3, b: IMat3, ref: IMat3) {
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2];
    const a10 = a[3],
      a11 = a[4],
      a12 = a[5];
    const a20 = a[6],
      a21 = a[7],
      a22 = a[8];

    const b00 = b[0],
      b01 = b[1],
      b02 = b[2];
    const b10 = b[3],
      b11 = b[4],
      b12 = b[5];
    const b20 = b[6],
      b21 = b[7],
      b22 = b[8];

    ref[0] = b00 * a00 + b01 * a10 + b02 * a20;
    ref[1] = b00 * a01 + b01 * a11 + b02 * a21;
    ref[2] = b00 * a02 + b01 * a12 + b02 * a22;
    ref[3] = b10 * a00 + b11 * a10 + b12 * a20;
    ref[4] = b10 * a01 + b11 * a11 + b12 * a21;
    ref[5] = b10 * a02 + b11 * a12 + b12 * a22;
    ref[6] = b20 * a00 + b21 * a10 + b22 * a20;
    ref[7] = b20 * a01 + b21 * a11 + b22 * a21;
    ref[8] = b20 * a02 + b21 * a12 + b22 * a22;

    return ref;
  },

  getTranslation(m: IMat3): IVec2 {
    return [m[6], m[7]];
  },

  getScaling(m: IMat3): IVec2 {
    return [m[0], m[4]];
  },

  getRotation(m: IMat3): number {
    return Math.atan2(m[3], m[0]);
  },
};
