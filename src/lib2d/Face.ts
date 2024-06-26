import { Matrix3, Vec2 } from 'three';
import { Curve } from './Curve';
import earcut from 'earcut';
import { IFaceData } from './2d.type';
import { Parser } from './Parser';

export class Face {
  constructor(
    public outline: Curve,
    public holes: Curve[] = []
  ) {}

  triangulate() {
    const _fVertices: number[] = [];

    const outlinePoints = this.outline.toPolyline();
    for (const point of outlinePoints) {
      _fVertices.push(point.x, point.y);
    }

    const holeIndices: number[] = [];

    for (const hole of this.holes) {
      const holePoints = hole.toPolyline();
      const holeIndex = _fVertices.length / 2;

      for (const point of holePoints) {
        _fVertices.push(point.x, point.y);
      }

      holeIndices.push(holeIndex);
    }

    const indices = earcut(_fVertices, holeIndices);

    const vertices: Vec2[] = [];
    for (let i = 0; i < _fVertices.length; i += 2) {
      vertices.push({ x: _fVertices[i], y: _fVertices[i + 1] });
    }

    return { vertices, indices };
  }

  toJSON(): IFaceData {
    return {
      type: 'face',
      outline: this.outline.toJSON(),
      holes: this.holes.map(hole => hole.toJSON()),
    };
  }

  fromJSON(json: IFaceData) {
    this.outline = Parser.parse(json.outline) as Curve;
    this.holes = json.holes.map(hole => Parser.parse(hole) as Curve);

    return this;
  }

  vertices() {
    const vertices: Vec2[] = [];

    vertices.push(...this.outline.vertices());

    for (const hole of this.holes) {
      vertices.push(...hole.vertices());
    }

    return vertices;
  }

  verticesExtend() {
    const list: { p: Vec2; type: 'outline' | 'hole'; index: number; curve: Curve }[] = [];

    list.push(...this.outline.vertices().map(p => ({ p, type: 'outline' as const, index: 0, curve: this.outline })));

    for (let i = 0; i < this.holes.length; i++) {
      const hole = this.holes[i];
      list.push(...hole.vertices().map(p => ({ p, type: 'hole' as const, index: i, curve: hole })));
    }

    return list;
  }

  clone() {
    return new Face(
      this.outline.clone(),
      this.holes.map(hole => hole.clone())
    );
  }

  applyMatrix(matrix: Matrix3) {
    this.outline.applyMatrix(matrix);

    for (const hole of this.holes) {
      hole.applyMatrix(matrix);
    }
  }
}
