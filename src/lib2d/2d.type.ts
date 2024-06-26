export type ICurveLineData = { type: 'line'; p0: number[]; p1: number[] };
export type ICurveCircleData = { type: 'circle'; center: number[]; radius: number };
export type ICurveArcData = { type: 'arc'; p0: number[]; p1: number[]; bulge: number };
export type ICurveWireData = { type: 'wire'; curves: ICurveData[] };

export type ICurveData = ICurveLineData | ICurveCircleData | ICurveWireData | ICurveArcData;
export type IFaceData = { type: 'face'; outline: ICurveData; holes: ICurveData[] };
export type IPrimitiveData = ICurveData | IFaceData;

export type INodeData<T = any> = {
  type: 'node';
  id: string;
  position: number[];
  rotation: number;
  scaling: number[];
  primitive?: IPrimitiveData;
  children?: INodeData[];
  userData?: T;
};
