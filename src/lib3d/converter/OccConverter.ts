import { BaseTopo } from '../Topo/BaseTopo';
import {
  oc,
  TopoDS_Shape,
  Handle_Geom_Curve,
  TopoDS_Edge,
  TopoDS_Wire,
  TopoDS_Face,
  __wrap,
  _explorer,
  TopoDS_Solid,
  Geom_Plane,
} from '../../extension/occ';
import { ICompound3dData, ICurve3dData, IEdge3dData, IFace3dData, ISolid3dData, ISurface3dData, IWire3dData } from '../3d.type';
import { Curve3d } from '../Geo/Curve3d';
import { Line3d } from '../Geo/Line3d';
import { Vector3 } from 'three';
import { Edge3d } from '../Topo/Edge3d';
import { Wire3d } from '../Topo/Wire3d';
import { Face3d } from '../Topo/Face3d';
import { Surface3d } from '../Geo/Surface3d';
import { Plane3d } from '../Geo/Plane3d';
import { Solid3d } from '../Topo/Solid3d';
import { BaseConverter } from './BaseConverter';

export class OccConverter extends BaseConverter<Uint8Array> {
  static brepFileToShape(file: Uint8Array): TopoDS_Shape {
    oc.FS.writeFile('in.brep', file);

    const $shape = new oc.TopoDS_Shape();
    const $builder = new oc.BRep_Builder();

    try {
      oc.BRepTools.Read_2($shape, 'in.brep', $builder, new oc.Message_ProgressRange_1());
      return $shape;
    } finally {
      $builder.delete();
    }
  }

  static shapeToBRepFile(shape: TopoDS_Shape): Uint8Array {
    oc.BRepTools.Write_3(shape, 'out.brep', new oc.Message_ProgressRange_1());
    const file = oc.FS.readFile('out.brep', { encoding: 'binary' });
    return file;
  }

  import_edge3d($edge: TopoDS_Edge): Edge3d {
    const firstRef = { current: 0 };
    const lastRef = { current: 0 };

    const $curve = __wrap(() => oc.BRep_Tool.Curve_2($edge, firstRef as any, lastRef as any), null);
    if (!$curve) throw new Error('Failed to extract curve from edge');

    const curveType = $curve.get().DynamicType().get().Name();

    if (curveType === 'Geom_Line') {
      const $p0 = $curve.get().Value(firstRef.current);
      const $p1 = $curve.get().Value(lastRef.current);

      const p0 = new Vector3($p0.X(), $p0.Y(), $p0.Z());
      const p1 = new Vector3($p1.X(), $p1.Y(), $p1.Z());
      const direction = p1.clone().sub(p0).normalize();

      const curve = new Line3d(p0, direction);

      return new Edge3d(curve, p0, p1);
    } else {
      throw new Error('Unsupported curve type: ' + curveType);
    }
  }

  import_wire3d($wire: TopoDS_Wire): Wire3d {
    const edges = _explorer($wire, 'edge');
    const edge3ds = edges.map(edge => this.import_edge3d(edge));
    return new Wire3d(edge3ds);
  }

  import_face3d($face: TopoDS_Face): Face3d {
    // 提取关联的 surface
    const $surface = __wrap(() => oc.BRep_Tool.Surface_2($face));

    const surfaceType = $surface.get().DynamicType().get().Name();
    let surface: Surface3d;

    if (surfaceType === 'Geom_Plane') {
      const $plane = $surface.get() as Geom_Plane;
      const $normal = $plane.Axis().Direction();
      const $loc = $plane.Location();

      const normal = new Vector3($normal.X(), $normal.Y(), $normal.Z());
      const locPnt = new Vector3($loc.X(), $loc.Y(), $loc.Z());

      const distance = Math.abs(normal.dot(locPnt));
      surface = new Plane3d(normal, distance);
    } else {
      throw new Error('Unsupported surface type: ' + surfaceType);
    }

    // 提取 outline 和 holes
    const $outline = oc.BRepTools.OuterWire($face);

    // TODO: 提取 holes

    const face = new Face3d(surface, this.import_wire3d($outline), []);
    return face;
  }

  import_solid3d($solid: TopoDS_Solid): Solid3d {
    const faces = _explorer($solid, 'face');
    const face3ds = faces.map(face => this.import_face3d(face));
    return new Solid3d(face3ds);
  }

  import(data: Uint8Array): BaseTopo {
    const $shape = OccConverter.brepFileToShape(data);

    if (_isEdge($shape)) return this.import_edge3d($shape);
    if (_isWire($shape)) return this.import_wire3d($shape);
    if (_isFace($shape)) return this.import_face3d(__wrap(() => oc.TopoDS.Face_1($shape)));
    if (_isSolid($shape)) return this.import_solid3d($shape);

    // @ts-expect-error
    throw new Error('Unsupported shape type: ' + $shape.ShapeType().value);
  }

  export(topo: BaseTopo) {
    const data = topo.toJSON();

    let $shape: TopoDS_Shape;

    if (data.type === 'edge3d') $shape = this.export_edge3d(data);
    else if (data.type === 'wire3d') $shape = this.export_wire3d(data);
    else if (data.type === 'face3d') $shape = this.export_face3d(data);
    else if (data.type === 'solid3d') $shape = this.export_solid3d(data);
    else throw new Error('Unsupported topo type: ' + data.type);

    return OccConverter.shapeToBRepFile($shape);
  }

  export_edge3d(data: IEdge3dData): TopoDS_Edge {
    const $curve = this.export_curve3d(data.curve);
    const $edge = __wrap(() =>
      new oc.BRepBuilderAPI_MakeEdge_26(
        $curve,
        new oc.gp_Pnt_3(data.p0[0], data.p0[1], data.p0[2]),
        new oc.gp_Pnt_3(data.p1[0], data.p1[1], data.p1[2])
      ).Edge()
    );
    return $edge;
  }

  export_wire3d(data: IWire3dData): TopoDS_Wire {
    const $wireMaker = new oc.BRepBuilderAPI_MakeWire_1();

    for (let edge of data.edges) {
      __wrap(() => $wireMaker.Add_1(this.export_edge3d(edge)));
    }

    return __wrap(() => $wireMaker.Wire());
  }

  export_face3d(data: IFace3dData) {
    if (data.type === 'face3d') {
      const $surface = this.export_surface3d(data.surface);
      const $outer = this.export_wire3d(data.outline);
      const $inner = data.holes.map(hole => this.export_wire3d(hole));

      const $faceMaker = new oc.BRepBuilderAPI_MakeFace_3($surface);

      // outer wire
      $faceMaker.Add($outer);

      // inner wires
      for (let $wire of $inner) {
        // 调整 orientation 成反向，因为内孔的方向是反的
        if ($wire.Orientation_1() === oc.TopAbs_Orientation.TopAbs_FORWARD) {
          $wire.Reverse();
        }

        $faceMaker.Add($wire);
      }

      return $faceMaker.Face();
    }

    throw new Error('Unsupported face type: ' + data.type);
  }

  export_solid3d(data: ISolid3dData) {
    const $builder = new oc.BRep_Builder();

    const $shell = new oc.TopoDS_Shell();
    $builder.MakeShell($shell);

    for (let face of data.faces) {
      const $face = this.export_face3d(face);
      $builder.Add($shell, $face);
    }

    const $solidMaker = new oc.BRepBuilderAPI_MakeSolid_1();
    $solidMaker.Add($shell);

    return $solidMaker.Solid();
  }

  export_compound3d(_data: ICompound3dData) {
    throw new Error('Method not implemented.');
  }

  export_curve3d(data: ICurve3dData): Handle_Geom_Curve {
    if (data.type === 'line3d') {
      const { p0, direction } = data;
      const $p0 = new oc.gp_Pnt_3(p0[0], p0[1], p0[2]);
      const $dir = new oc.gp_Dir_4(direction[0], direction[1], direction[2]);
      const $line = new oc.Geom_Line_3($p0, $dir);
      return new oc.Handle_Geom_Curve_2($line);
    }

    throw new Error('Unsupported curve type: ' + data.type);
  }

  export_surface3d(data: ISurface3dData) {
    if (data.type === 'plane3d') {
      const { normal, distance } = data;
      const $normal = new oc.gp_Dir_4(normal[0], normal[1], normal[2]);
      const $pnt = new oc.gp_Pnt_2($normal.XYZ().Multiplied_1(distance));
      const $plane = new oc.gp_Pln_3($pnt, $normal);
      return $plane;
    }

    throw new Error('Unsupported surface type: ' + data.type);
  }
}

function _isEdge(s: any): s is TopoDS_Edge {
  // @ts-expect-error
  return s.ShapeType().value === oc.TopAbs_ShapeEnum.TopAbs_EDGE.value;
}

function _isWire(s: any): s is TopoDS_Wire {
  // @ts-expect-error
  return s.ShapeType().value === oc.TopAbs_ShapeEnum.TopAbs_WIRE.value;
}

function _isFace(s: any): s is TopoDS_Face {
  // @ts-expect-error
  return s.ShapeType().value === oc.TopAbs_ShapeEnum.TopAbs_FACE.value;
}

function _isSolid(s: any): s is TopoDS_Solid {
  // @ts-expect-error
  return s.ShapeType().value === oc.TopAbs_ShapeEnum.TopAbs_SOLID.value;
}
