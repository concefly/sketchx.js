import { Vec3Util } from '../../Vec3Util';
import { IVec3 } from '../../typing';
import { Plane3d } from '../Geo/Plane3d';
import { BaseAlgo3d } from './BaseAlgo3d';
import * as nc from 'numeric';

export class FittingAlgo3d extends BaseAlgo3d {
  static fitPlane(points: IVec3[]): Plane3d {
    // 1. 计算点集的质心
    const centroid = [0, 0, 0] as IVec3;
    points.forEach(p => Vec3Util.add(centroid, p, centroid));

    const n = points.length;
    centroid[0] /= n;
    centroid[1] /= n;
    centroid[2] /= n;

    // 2. 计算点到质心的协方差矩阵
    let cov: number[][] = [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ];

    for (const p of points) {
      const v = Vec3Util.sub(p, centroid, [0, 0, 0]);

      cov[0][0] += v[0] * v[0];
      cov[0][1] += v[0] * v[1];
      cov[0][2] += v[0] * v[2];

      cov[1][0] += v[1] * v[0];
      cov[1][1] += v[1] * v[1];
      cov[1][2] += v[1] * v[2];

      cov[2][0] += v[2] * v[0];
      cov[2][1] += v[2] * v[1];
      cov[2][2] += v[2] * v[2];
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

    const normal = [eigVec[0][minValIdx], eigVec[1][minValIdx], eigVec[2][minValIdx]] as IVec3;

    let distance = Vec3Util.dot(normal, centroid);

    // 5. 确保法向量指向正方向
    if (distance < 0) {
      Vec3Util.negate(centroid, centroid);
      distance = -distance;
    }

    return new Plane3d(normal, distance);
  }

  run() {}
}
