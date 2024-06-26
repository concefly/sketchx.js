import { Vec2 } from 'three';
import { ICurveData, IFaceData, INodeData } from './2d.type';
import { Arc } from './Arc';
import { Circle } from './Circle';
import { Curve } from './Curve';
import { Wire } from './Wire';
import { Line } from './Line';
import { Face } from './Face';
import { Node } from './Node';

type _TypeMap = {
  line: Line;
  circle: Circle;
  wire: Wire;
  arc: Arc;
  face: Face;
  node: Node;
};

export class Parser {
  static isCurveData = (data: any): data is ICurveData => {
    return data.type === 'line' || data.type === 'circle' || data.type === 'wire' || data.type === 'arc';
  };

  static isFaceData = (data: any): data is IFaceData => {
    return data.type === 'face';
  };

  static parseCurve = (data: ICurveData): _TypeMap[ICurveData['type']] => {
    const _callMap: { [T in ICurveData['type']]: (data: Extract<ICurveData, { type: T }>) => Curve } = {
      line: data => new Line({ x: 0, y: 0 }, { x: 0, y: 0 }).fromJSON(data),
      circle: data => new Circle({ x: 0, y: 0 }, 0).fromJSON(data),
      wire: data => new Wire([]).fromJSON(data),
      arc: data => new Arc({ x: 0, y: 0 }, { x: 0, y: 0 }, 0).fromJSON(data),
    };

    // @ts-expect-error
    const curve = _callMap[data.type](data);
    return curve as any;
  };

  static parseFace = (data: IFaceData) => {
    const face = new Face(null as any).fromJSON(data);
    return face;
  };

  static parseNode = (data: INodeData) => {
    const node = new Node(null as any).fromJSON(data);
    return node;
  };

  static parse = <T extends ICurveData | IFaceData | INodeData>(data: T): _TypeMap[T['type']] => {
    if (data.type === 'node') return this.parseNode(data) as any;
    if (data.type === 'face') return this.parseFace(data) as any;
    return this.parseCurve(data as ICurveData) as any;
  };
}
