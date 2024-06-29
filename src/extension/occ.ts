import ocFullJS, {
  BRepAlgoAPI_BooleanOperation,
  OpenCascadeInstance,
  TDF_Label,
  TopoDS_CompSolid,
  TopoDS_Compound,
  TopoDS_Edge,
  TopoDS_Face,
  TopoDS_Shape,
  TopoDS_Shell,
  TopoDS_Solid,
  TopoDS_Vertex,
  TopoDS_Wire,
} from 'opencascade.js/dist/opencascade.full.js';
import { DefaultLogger } from '../Logger';
import { Vec3Util } from '../Vec3Util';

export type {
  BRepAlgoAPI_BooleanOperation,
  OpenCascadeInstance,
  TDF_Label,
  TopoDS_CompSolid,
  TopoDS_Compound,
  TopoDS_Edge,
  TopoDS_Face,
  TopoDS_Shape,
  TopoDS_Shell,
  TopoDS_Solid,
  TopoDS_Vertex,
  TopoDS_Wire,
  Handle_Geom_Curve,
  Geom_Surface,
  Geom_Plane,
} from 'opencascade.js/dist/opencascade.full.js';

(Symbol as any).dispose ??= Symbol('Symbol.dispose');
(Symbol as any).asyncDispose ??= Symbol('Symbol.asyncDispose');

const logger = DefaultLogger.extend('OCC');
export let oc: OpenCascadeInstance;

async function setup() {
  if (oc) return;

  logger.info('Initializing OpenCascade');

  // @ts-expect-error
  oc = await new ocFullJS({
    locateFile(path: string) {
      return `https://unpkg.com/opencascade.js@2.0.0-beta.b5ff984/dist/${path}`;
    },
  });

  // for (let lib of libs) {
  //   await oc.loadDynamicLibrary(lib, { loadAsync: true, global: true, nodelete: true, allowUndefined: false });
  // }

  logger.info('OpenCascade initialized');
}

export const OCCReadyPromise = setup();

export function convertException(err: any) {
  if (typeof err === 'number') {
    const exceptionData = oc.OCJS.getStandard_FailureData(err);
    const msg = exceptionData.GetMessageString();

    return new Error(msg);
  }

  return err;
}

export function triangulate(shape: TopoDS_Shape) {
  // if shape is null, return empty
  if (shape.IsNull()) {
    logger.warn('triangulate shape is null');
    return { vertices: [] };
  }

  let isLine = false;
  const vertices: number[] = [];
  const normals: number[] = [];
  const indices: number[] = [];
  const faceRanges: [number, number][] = [];

  // wire
  if (_isWire(shape)) {
    isLine = true;

    // @ts-expect-error
    const exp = new oc.TopExp_Explorer_2(shape, oc.TopAbs_ShapeEnum.TopAbs_EDGE, oc.TopAbs_ShapeEnum.TopAbs_SHAPE);
    for (; exp.More(); exp.Next()) {
      const edge = oc.TopoDS.Edge_1(exp.Current());

      const points = pickPointsFromEdge(edge);
      for (let p of points) vertices.push(p[0], p[1], p[2]);
    }
  }

  // edge
  else if (_isEdge(shape)) {
    isLine = true;

    const points = pickPointsFromEdge(shape);
    for (let p of points) vertices.push(p[0], p[1], p[2]);
  }

  // 上面都没有匹配到，那么就是一个面, 需要进行三角化
  // =================================================================================================
  else {
    // 线性偏差 控制网格密度的参数。较小的值会生成更密集的网格。
    const linearDeflection = 0.1;

    // 角偏差 控制曲面平滑度的参数。较小的值会生成更平滑的曲面。
    const angularDeflection = 0.5;

    // 三角化后，shape 中的每个面都会被转换成三角形网格
    const $mesh = new oc.BRepMesh_IncrementalMesh_2(shape, linearDeflection, false, angularDeflection, false);

    if (!$mesh.IsDone()) {
      console.warn('Failed to mesh shape');
      return { vertices: [] };
    }

    // 遍历 shape 中的所有面
    // @ts-expect-error
    const $fExp = new oc.TopExp_Explorer_2(shape, oc.TopAbs_ShapeEnum.TopAbs_FACE, oc.TopAbs_ShapeEnum.TopAbs_FACE);

    let _vOffset = 0;
    let _faceIndex = 0;

    for (; $fExp.More(); $fExp.Next(), _faceIndex += 1) {
      const $face = oc.TopoDS.Face_1($fExp.Current());

      // 获取面的三角形网格
      const loc = new oc.TopLoc_Location_1();
      const triangulation = oc.BRep_Tool.Triangulation($face, loc, 0); // 2: Poly_MeshPurpose_Presentation

      if (triangulation.IsNull()) {
        console.warn(`triangulation is null, faceNo=${_faceIndex}`);
        continue;
      }

      // 获取三角形网格的顶点和索引
      const triangles = triangulation.get().Triangles();

      // @ts-expect-error
      const ori = $face.Orientation_1().value as any as 0 | 1;

      const _faceRangeStart = _vOffset;

      // 遍历所有的三角面
      for (let i = triangles.Lower(); i <= triangles.Upper(); i++, _vOffset += 3) {
        const tri = triangles.Value(i);

        // 需要根据面的方向来确定三角形的顶点顺序，确保法线方向朝外
        const [p1, p2, p3] = (ori === 0 ? [1, 2, 3] : [1, 3, 2]).map(i => triangulation.get().Node(tri.Value(i)));

        vertices.push(p1.X(), p1.Y(), p1.Z());
        vertices.push(p2.X(), p2.Y(), p2.Z());
        vertices.push(p3.X(), p3.Y(), p3.Z());

        // 计算三角形的法线
        const n = new oc.gp_Vec_5(p1, p2).Crossed(new oc.gp_Vec_5(p1, p3));
        const nLen = n.Magnitude();

        normals.push(n.X() / nLen, n.Y() / nLen, n.Z() / nLen);
        normals.push(n.X() / nLen, n.Y() / nLen, n.Z() / nLen);
        normals.push(n.X() / nLen, n.Y() / nLen, n.Z() / nLen);

        indices.push(_vOffset, _vOffset + 1, _vOffset + 2);
      }

      const _faceRangeEnd = _vOffset;
      faceRanges.push([_faceRangeStart, _faceRangeEnd]);
    }
  }

  return { vertices, indices, normals, isLine, faceRanges };
}

export function _explorer($s: TopoDS_Shape, type: 'compound', makeUnique?: boolean): TopoDS_Compound[];
export function _explorer($s: TopoDS_Shape, type: 'compsolid', makeUnique?: boolean): TopoDS_CompSolid[];
export function _explorer($s: TopoDS_Shape, type: 'solid', makeUnique?: boolean): TopoDS_Solid[];
export function _explorer($s: TopoDS_Shape, type: 'shell', makeUnique?: boolean): TopoDS_Shell[];
export function _explorer($s: TopoDS_Shape, type: 'face', makeUnique?: boolean): TopoDS_Face[];
export function _explorer($s: TopoDS_Shape, type: 'wire', makeUnique?: boolean): TopoDS_Wire[];
export function _explorer($s: TopoDS_Shape, type: 'edge', makeUnique?: boolean): TopoDS_Edge[];
export function _explorer($s: TopoDS_Shape, type: 'vertex', makeUnique?: boolean): TopoDS_Vertex[];
export function _explorer($s: TopoDS_Shape, type: string, makeUnique?: boolean) {
  let toFind: any;

  if (type === 'compound') toFind = oc.TopAbs_ShapeEnum.TopAbs_COMPOUND;
  else if (type === 'compsolid') toFind = oc.TopAbs_ShapeEnum.TopAbs_COMPSOLID;
  else if (type === 'solid') toFind = oc.TopAbs_ShapeEnum.TopAbs_SOLID;
  else if (type === 'shell') toFind = oc.TopAbs_ShapeEnum.TopAbs_SHELL;
  else if (type === 'face') toFind = oc.TopAbs_ShapeEnum.TopAbs_FACE;
  else if (type === 'wire') toFind = oc.TopAbs_ShapeEnum.TopAbs_WIRE;
  else if (type === 'edge') toFind = oc.TopAbs_ShapeEnum.TopAbs_EDGE;
  else if (type === 'vertex') toFind = oc.TopAbs_ShapeEnum.TopAbs_VERTEX;
  else throw new Error('Invalid type: ' + type);

  using $exp = __resource(new oc.TopExp_Explorer_2($s, toFind, toFind));
  const list: TopoDS_Shape[] = [];

  const $unique = makeUnique ? __resource(new oc.TopTools_IndexedMapOfShape_1()) : null;

  for (let id = 0; $exp.More(); $exp.Next(), id++) {
    let $comp: TopoDS_Shape;

    if (type === 'compound') $comp = oc.TopoDS.Compound_1($exp.Current());
    else if (type === 'compsolid') $comp = oc.TopoDS.CompSolid_1($exp.Current());
    else if (type === 'solid') $comp = oc.TopoDS.Solid_1($exp.Current());
    else if (type === 'shell') $comp = oc.TopoDS.Shell_1($exp.Current());
    else if (type === 'face') $comp = oc.TopoDS.Face_1($exp.Current());
    else if (type === 'wire') $comp = oc.TopoDS.Wire_1($exp.Current());
    else if (type === 'edge') $comp = oc.TopoDS.Edge_1($exp.Current());
    else if (type === 'vertex') $comp = oc.TopoDS.Vertex_1($exp.Current());
    else throw new Error('Invalid type: ' + type);

    if (makeUnique && $unique) {
      if ($unique.Contains($comp)) continue;
      $unique.Add($comp);
    }

    list.push($comp);
  }

  return list;
}

export function __wrap<T>(cb: () => T, fallback?: T): T {
  const _stack = new Error().stack;

  try {
    return cb();
  } catch (err) {
    err = convertException(err);
    console.warn('Failed to execute wrapped function', err, '\n----- async -----\n', _stack);

    if (typeof fallback !== 'undefined') return fallback;

    throw err;
  }
}

export function _isEdge(s: TopoDS_Shape): s is TopoDS_Edge {
  // @ts-expect-error
  return s.ShapeType().value === oc.TopAbs_ShapeEnum.TopAbs_EDGE.value;
}

export function _isWire(s: TopoDS_Shape): s is TopoDS_Wire {
  // @ts-expect-error
  return s.ShapeType().value === oc.TopAbs_ShapeEnum.TopAbs_WIRE.value;
}

export function _isFace(s: TopoDS_Shape): s is TopoDS_Face {
  // @ts-expect-error
  return s.ShapeType().value === oc.TopAbs_ShapeEnum.TopAbs_FACE.value;
}

function pickPointsFromEdge(edge: TopoDS_Shape, countIfCurve: number = 128): number[][] {
  const firstRef = { current: 0 };
  const lastRef = { current: 0 };

  const $curve = __wrap(() => oc.BRep_Tool.Curve_2(edge, firstRef as any, lastRef as any), null);
  if (!$curve || $curve.IsNull()) return [];

  const curveType = $curve.get().DynamicType().get().Name();

  let points: number[][] = [];

  // 如果是直线，直接取两个端点
  if (curveType === 'Geom_Line') {
    const p1 = $curve.get().Value(firstRef.current);
    const p2 = $curve.get().Value(lastRef.current);
    points.push([p1.X(), p1.Y(), p1.Z()], [p2.X(), p2.Y(), p2.Z()]);
  }

  // 如果是其他类型，取一定数量的点
  else {
    for (let i = 0; i <= countIfCurve; i++) {
      const amount = (i / countIfCurve) * (lastRef.current - firstRef.current) + firstRef.current;

      const p = $curve.get().Value(amount);
      points.push([p.X(), p.Y(), p.Z()]);
    }

    // 共线判断
    if (_isPointsCollinear(points)) {
      points = [points[0], points[points.length - 1]];
    }
  }

  return points;
}

function _isPointsCollinear(points: number[][], tol = 1e-6) {
  if (points.length < 3) return true;

  // const v0 = new Vector3().fromArray(points[0]);
  // const v1 = new Vector3().fromArray(points[1]);
  // const vecBase = new Vector3().subVectors(v1, v0).normalize();

  const v0 = [0, 0, 0];
  const v1 = [0, 0, 0];

  Vec3Util.copy(points[1], v0);
  Vec3Util.copy(points[2], v1);

  const vecBase = Vec3Util.sub(v1, v0, []);
  Vec3Util.normalize(vecBase, vecBase);

  const vp = [0, 0, 0];

  for (let i = 1; i < points.length - 1; i++) {
    Vec3Util.copy(points[i], v0);
    Vec3Util.copy(points[i + 1], v1);

    Vec3Util.sub(v1, v0, vp);

    // 检查叉积的大小是否在容差范围内
    const cross = Vec3Util.length(Vec3Util.cross(vp, vecBase, []));
    if (cross > tol) return false;
  }

  return true;
}

function __resource<T extends { delete: Function }>(obj: T): T & Disposable {
  const _stack = new Error().stack;

  Object.defineProperty(obj, Symbol.dispose, {
    value: () => {
      try {
        obj.delete();
      } catch (err) {
        console.warn('Failed to delete resource', err, '\n----- async -----\n', _stack);
      }
    },
  });
  return obj as any;
}
