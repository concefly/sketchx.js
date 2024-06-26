import { BaseAlgo } from './BaseAlgo';
import { Clipper2, PathD, PathsD } from '../../extension/clipper2';
import { Face } from '../Face';
import { Wire } from '../Wire';
import { Vector2 } from 'three';
import { FittingAlgo } from './FittingAlgo';
import { Curve } from '../Curve';
import { ICurveData } from '../2d.type';

export class BoolAlgo extends BaseAlgo {
  constructor(
    public src: Face,
    public tool: Face,
    public op: 'union' | 'difference' | 'intersection'
  ) {
    super();
  }

  run() {
    const subject = _makePathsD(this.src);
    const clip = _makePathsD(this.tool);

    const fRule = Clipper2.FillRule.EvenOdd; // 因为 Face 的内外孔方向相反，所以这里用 EvenOdd 来处理
    const precision = 3; // 小数点后的位数

    let solution: PathsD | null = null;

    // evaluate boolean operation
    if (this.op === 'union') solution = Clipper2.UnionD(subject, clip, fRule, precision);
    else if (this.op === 'difference') solution = Clipper2.DifferenceD(subject, clip, fRule, precision);
    else if (this.op === 'intersection') solution = Clipper2.IntersectD(subject, clip, fRule, precision);

    if (!solution) return false;

    const wireCnt = solution.size();
    if (wireCnt === 0) return false;

    // make new face
    // const outline = new FittingAlgo(_makePolygonPnts(solution.get(0))).run();
    const outline = new Wire([]).fromPolyline(_makePolygonPnts(solution.get(0)));
    const holes: Curve[] = [];

    for (let i = 1; i < wireCnt; i++) {
      const pnts = _makePolygonPnts(solution.get(i));
      // const hole = new FittingAlgo(pnts).run();
      const hole = new Wire([]).fromPolyline(pnts);
      if (hole.length === 0) continue;

      hole.reverse(); // 内孔的方向要反向
      holes.push(hole);
    }

    // mutate src
    this.src.outline = outline;
    this.src.holes = holes;

    return true;
  }
}

function _makePathsD(face: Face) {
  const pathsD = new Clipper2.PathsD();

  // outline
  const outlinePnts: number[] = [];
  for (const p of face.outline.toPolyline()) outlinePnts.push(p.x, p.y);

  pathsD.push_back(Clipper2.MakePathD(outlinePnts));

  // holes
  for (const hole of face.holes) {
    const holePnts: number[] = [];
    for (const p of hole.toPolyline()) holePnts.push(p.x, p.y);

    pathsD.push_back(Clipper2.MakePathD(holePnts));
  }

  return pathsD;
}

// 这个会闭合
function _makePolygonPnts(path: PathD): Vector2[] {
  const list: Vector2[] = [];
  const cnt = path.size();

  for (let i = 0; i < cnt; i++) {
    const p = path.get(i);
    list.push(new Vector2(p.x, p.y));
  }

  // close: path 读取出来的点是开放的，需要手动闭合
  const p = path.get(0);
  list.push(new Vector2(p.x, p.y));

  return list;
}
