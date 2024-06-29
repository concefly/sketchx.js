import { IMat4 } from './typing';

export const Mat4Util = {
  copy(m: IMat4, ref: IMat4) {
    ref[0] = m[0];
    ref[1] = m[1];
    ref[2] = m[2];
    ref[3] = m[3];
    ref[4] = m[4];
    ref[5] = m[5];
    ref[6] = m[6];
    ref[7] = m[7];
    ref[8] = m[8];
    ref[9] = m[9];
    ref[10] = m[10];
    ref[11] = m[11];
    ref[12] = m[12];
    ref[13] = m[13];
    ref[14] = m[14];
    ref[15] = m[15];

    return ref;
  },

  identity(ref: IMat4) {
    ref[0] = 1;
    ref[1] = 0;
    ref[2] = 0;
    ref[3] = 0;
    ref[4] = 0;
    ref[5] = 1;
    ref[6] = 0;
    ref[7] = 0;
    ref[8] = 0;
    ref[9] = 0;
    ref[10] = 1;
    ref[11] = 0;
    ref[12] = 0;
    ref[13] = 0;
    ref[14] = 0;
    ref[15] = 1;

    return ref;
  },

  invert(m: IMat4, ref: IMat4) {
    const n11 = m[0],
      n21 = m[1],
      n31 = m[2],
      n41 = m[3];
    const n12 = m[4],
      n22 = m[5],
      n32 = m[6],
      n42 = m[7];
    const n13 = m[8],
      n23 = m[9],
      n33 = m[10],
      n43 = m[11];
    const n14 = m[12],
      n24 = m[13],
      n34 = m[14],
      n44 = m[15];

    const t11 = n44 * n33 * n22 - n43 * n34 * n22 - n44 * n32 * n23 + n42 * n34 * n23 + n43 * n32 * n24 - n42 * n33 * n24;
    const t12 = n43 * n34 * n21 - n44 * n33 * n21 + n44 * n31 * n23 - n41 * n34 * n23 - n43 * n31 * n24 + n41 * n33 * n24;
    const t13 = n44 * n32 * n21 - n42 * n34 * n21 - n44 * n31 * n22 + n41 * n34 * n22 + n42 * n31 * n24 - n41 * n32 * n24;
    const t14 = n42 * n33 * n21 - n43 * n32 * n21 + n43 * n31 * n22 - n41 * n33 * n22 - n42 * n31 * n23 + n41 * n32 * n23;

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

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
      ref[9] = 0;
      ref[10] = 0;
      ref[11] = 0;
      ref[12] = 0;
      ref[13] = 0;
      ref[14] = 0;
      ref[15] = 0;
      return ref;
    }

    const detInv = 1 / det;

    ref[0] = t11 * detInv;
    ref[1] = (n34 * n23 * n12 - n33 * n24 * n12 - n34 * n22 * n13 + n32 * n24 * n13 + n33 * n22 * n14 - n32 * n23 * n14) * detInv;
    ref[2] = (n43 * n24 * n12 - n44 * n23 * n12 + n44 * n22 * n13 - n42 * n24 * n13 - n43 * n22 * n14 + n42 * n23 * n14) * detInv;
    ref[3] = (n44 * n33 * n12 - n43 * n34 * n12 - n44 * n32 * n13 + n42 * n34 * n13 + n43 * n32 * n14 - n42 * n33 * n14) * detInv;

    ref[4] = t12 * detInv;
    ref[5] = (n33 * n24 * n11 - n34 * n23 * n11 + n34 * n21 * n13 - n31 * n24 * n13 - n33 * n21 * n14 + n31 * n23 * n14) * detInv;
    ref[6] = (n44 * n23 * n11 - n43 * n24 * n11 - n44 * n21 * n13 + n41 * n24 * n13 + n43 * n21 * n14 - n41 * n23 * n14) * detInv;
    ref[7] = (n43 * n34 * n11 - n44 * n33 * n11 + n44 * n31 * n13 - n41 * n34 * n13 - n43 * n31 * n14 + n41 * n33 * n14) * detInv;

    ref[8] = t13 * detInv;
    ref[9] = (n34 * n22 * n11 - n32 * n24 * n11 - n34 * n21 * n12 + n31 * n24 * n12 + n32 * n21 * n14 - n31 * n22 * n14) * detInv;
    ref[10] = (n42 * n24 * n11 - n44 * n22 * n11 + n44 * n21 * n12 - n41 * n24 * n12 - n42 * n21 * n14 + n41 * n22 * n14) * detInv;
    ref[11] = (n44 * n32 * n11 - n42 * n34 * n11 - n44 * n31 * n12 + n41 * n34 * n12 + n42 * n31 * n14 - n41 * n32 * n14) * detInv;

    ref[12] = t14 * detInv;
    ref[13] = (n32 * n23 * n11 - n33 * n22 * n11 + n33 * n21 * n12 - n31 * n23 * n12 - n32 * n21 * n13 + n31 * n22 * n13) * detInv;
    ref[14] = (n43 * n22 * n11 - n42 * n23 * n11 - n43 * n21 * n12 + n41 * n23 * n12 + n42 * n21 * n13 - n41 * n22 * n13) * detInv;
    ref[15] = (n42 * n33 * n11 - n43 * n32 * n11 + n43 * n31 * n12 - n41 * n33 * n12 - n42 * n31 * n13 + n41 * n32 * n13) * detInv;

    return ref;
  },

  makeRotation(euler: number[], ref: IMat4) {
    return this.compose([0, 0, 0], euler, [1, 1, 1], ref);
  },

  makeScaling(sx: number, sy: number, sz: number, ref: IMat4) {
    return this.compose([0, 0, 0], [0, 0, 0], [sx, sy, sz], ref);
  },

  makeTranslation(tx: number, ty: number, tz: number, ref: IMat4) {
    return this.compose([tx, ty, tz], [0, 0, 0], [1, 1, 1], ref);
  },

  compose(translation: number[], rotation: number[], scaling: number[], ref: IMat4) {
    const x = rotation[0];
    const y = rotation[1];
    const z = rotation[2];

    const cx = Math.cos(x);
    const sx = Math.sin(x);
    const cy = Math.cos(y);
    const sy = Math.sin(y);
    const cz = Math.cos(z);
    const sz = Math.sin(z);

    const sxsz = sx * sz;
    const cycz = cy * cz;
    const sxszcycz = sxsz * cycz;
    const cxsx = cx * sx;
    const cxcy = cx * cy;
    const cxcycz = cxcy * cycz;

    ref[0] = scaling[0] * cycz;
    ref[1] = scaling[0] * sz * cxcy;
    ref[2] = scaling[0] * sy * sx;
    ref[3] = 0;

    ref[4] = scaling[1] * sxsz * cycz - cx * sz;
    ref[5] = scaling[1] * sxsz * sz + cx * cz;
    ref[6] = scaling[1] * sx * cy;
    ref[7] = 0;

    ref[8] = scaling[2] * cxsx * cycz + sx * sz;
    ref[9] = scaling[2] * cxsx * sz - sx * cz;
    ref[10] = scaling[2] * cx * cy;
    ref[11] = 0;

    ref[12] = translation[0];
    ref[13] = translation[1];
    ref[14] = translation[2];
    ref[15] = 1;

    return ref;
  },

  multiply(a: IMat4, b: IMat4, ref: IMat4) {
    const a00 = a[0],
      a01 = a[1],
      a02 = a[2],
      a03 = a[3];
    const a10 = a[4],
      a11 = a[5],
      a12 = a[6],
      a13 = a[7];
    const a20 = a[8],
      a21 = a[9],
      a22 = a[10],
      a23 = a[11];
    const a30 = a[12],
      a31 = a[13],
      a32 = a[14],
      a33 = a[15];

    const b00 = b[0],
      b01 = b[1],
      b02 = b[2],
      b03 = b[3];
    const b10 = b[4],
      b11 = b[5],
      b12 = b[6],
      b13 = b[7];
    const b20 = b[8],
      b21 = b[9],
      b22 = b[10],
      b23 = b[11];
    const b30 = b[12],
      b31 = b[13],
      b32 = b[14],
      b33 = b[15];

    ref[0] = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    ref[1] = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    ref[2] = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    ref[3] = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;

    ref[4] = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    ref[5] = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    ref[6] = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    ref[7] = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;

    ref[8] = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    ref[9] = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    ref[10] = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    ref[11] = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;

    ref[12] = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
    ref[13] = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
    ref[14] = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
    ref[15] = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

    return ref;
  },

  getTranslation(m: IMat4): number[] {
    return [m[12], m[13], m[14]];
  },

  getScaling(m: IMat4): number[] {
    return [m[0], m[5], m[10]];
  },

  getRotation(m: IMat4): number[] {
    const x = Math.atan2(m[9], m[14]);
    const y = Math.asin(-m[6]);
    const z = Math.atan2(m[4], m[0]);

    return [x, y, z];
  },
};
