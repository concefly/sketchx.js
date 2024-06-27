import { IVec2 } from '../typing';

export type ICurveLineData = { type: 'line'; p0: IVec2; p1: IVec2 };
export type ICurveCircleData = { type: 'circle'; center: IVec2; radius: number };
export type ICurveArcData = { type: 'arc'; p0: IVec2; p1: IVec2; bulge: number };
export type ICurveWireData = { type: 'wire'; curves: ICurveData[] };

export type ICurveData = ICurveLineData | ICurveCircleData | ICurveWireData | ICurveArcData;
export type IFaceData = { type: 'face'; outline: ICurveData; holes: ICurveData[] };
export type IPrimitiveData = ICurveData | IFaceData;

export type INodeData<T = any> = {
  type: 'node';
  id: string;
  position: IVec2;
  rotation: number;
  scaling: IVec2;
  primitive?: IPrimitiveData;
  children?: INodeData[];
  userData?: T;
};
