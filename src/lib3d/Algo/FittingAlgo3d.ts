import { Vector3 } from 'three';
import { Plane3d } from '../Geo/Plane3d';
import { BaseAlgo3d } from './BaseAlgo3d';
import * as nc from 'numeric';

export class FittingAlgo3d extends BaseAlgo3d {
  static fitPlane(points: Vector3[]): Plane3d {
    // 1. 计算点集的质心
    const centroid = new Vector3();
    points.forEach(p => centroid.add(p));
    centroid.divideScalar(points.length);

    // 2. 计算点到质心的协方差矩阵
    let cov: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    for (const p of points) {
      const v = p.clone().sub(centroid);
      cov[0][0] += v.x * v.x;
      cov[0][1] += v.x * v.y;
      cov[0][2] += v.x * v.z;

      cov[1][0] += v.y * v.x;
      cov[1][1] += v.y * v.y;
      cov[1][2] += v.y * v.z;

      cov[2][0] += v.z * v.x;
      cov[2][1] += v.z * v.y;
      cov[2][2] += v.z * v.z;
    }

    cov = nc.div(nc.mul(cov, 1 / points.length), 1);

    // 3. 计算协方差矩阵的特征向量
    const eig = nc.eig(cov);
    const eigVal = eig.lambda.x as number[];
    const eigVec = eig.E.x as number[][];

    // 4. 选择最小特征值对应的特征向量
    let minValIdx = 0;
    for (let i = 1; i < eigVal.length; i++) {
      if (eigVal[i] < eigVal[minValIdx]) {
        minValIdx = i;
      }
    }

    const normal = new Vector3(eigVec[0][minValIdx], eigVec[1][minValIdx], eigVec[2][minValIdx]);
    let distance = normal.dot(centroid);

    // 5. 确保法向量指向正方向
    if (distance < 0) {
      normal.negate();
      distance = -distance;
    }

    return new Plane3d(normal, distance);
  }

  run() {}
}
