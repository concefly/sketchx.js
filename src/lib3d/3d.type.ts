export type ILine3dData = { type: 'line3d'; p0: number[]; direction: number[] };
export type ICurve3dData = ILine3dData;

export type IPlane3dData = { type: 'plane3d'; normal: number[]; distance: number };
export type ISurface3dData = IPlane3dData;

export type IEdge3dData = { type: 'edge3d'; curve: ICurve3dData; p0: number[]; p1: number[] };
export type IWire3dData = { type: 'wire3d'; edges: IEdge3dData[] };
export type IFace3dData = { type: 'face3d'; surface: ISurface3dData; outline: IWire3dData; holes: IWire3dData[] };
export type ISolid3dData = { type: 'solid3d'; faces: IFace3dData[] };
export type ICompound3dData = { type: 'compound3d'; solids: ISolid3dData[] };
export type ITopo3dData = IEdge3dData | IWire3dData | IFace3dData | ISolid3dData | ICompound3dData;
