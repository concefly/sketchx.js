import { Vec2, Vector3 } from 'three';

export const TMP_VEC2 = Array(10)
  .fill(0)
  .map(() => ({ x: 0, y: 0 }) as Vec2);

export const TMP_VEC3 = Array(10)
  .fill(0)
  .map(() => new Vector3());
