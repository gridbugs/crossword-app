declare module 'cv';

export declare function callOnRuntimeInitialized(f: () => void): void;

export type int = number;
export type double = number;

export declare class Point {
  public constructor(x: number, y: number);
  public x: number;
  public y: number;
}

export declare class Size {
  public constructor(width: number, height: number);
  public width: number;
  public height: number;
}

export declare class Mat {
  clone(): Mat;
  size(): Size;
  intPtr(i: int, j: int): Int32Array;
  delete(): void;
}
export type InputArray = Mat;
export type InputOutputArray = Mat;
export type OutputArray = Mat;

export declare class MatVector {
  size(): int;
  get(i: int): Mat;
}
export type InputArrayOfArrays = MatVector;
export type OutputArrayOfArrays = MatVector;

export declare function imread(canvasOrImageHtmlElement: HTMLElement | string): Mat
export declare function imshow(canvasSource: HTMLElement | string, mat: Mat): void

export declare function cvtColor(src: InputArray, dst: OutputArray, code: int, dstCn?: int): void;

export declare function bitwise_not(src: InputArray, dst: OutputArray, mask?: InputArray): void;

export declare function findContours(image: InputArray, contours: OutputArrayOfArrays, hierarchy: OutputArray, mode: int, method: int, offset?: Point): void

export declare function arcLength(curve: InputArray, closed: boolean): double;

export declare function approxPolyDP(curve: InputArray, approxCurve: OutputArray, epsilon: double, closed: boolean): void;

export declare function contourArea(contour: InputArray, oriented?: boolean): double;

export declare function drawContours(image: InputOutputArray, contours: InputArrayOfArrays, contourIdx: int, color: any, thickness?: int, lineType?: int, hierarchy?: InputArray, maxLevel?: int, offset?: Point): void;

export type ColorConversionCodes = any;
export declare const COLOR_BGR2GRAY: ColorConversionCodes; // initializer: = 6

export type RetrievalModes = any;
export declare const RETR_TREE: RetrievalModes; // initializer: = 3

export type ContourApproximationModes = any;
export declare const CHAIN_APPROX_SIMPLE: ContourApproximationModes; // initializer: = 2
