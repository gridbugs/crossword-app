import * as cv from '../js/cv';
import * as coord2 from './coord2';
import { Coord2 } from './coord2';

/** Returns a polygon approximating a contour, expressed as a cv.Mat */
function approximatePolyOfContour(contour: cv.Mat): cv.Mat {
  const APPROX_POLYGON_EPS_RATIO_OF_PERIMETER = 0.02;
  const perimeter = cv.arcLength(contour, true);
  const approxPolygon = new cv.Mat();
  const approxPolygonEpsilon = APPROX_POLYGON_EPS_RATIO_OF_PERIMETER * perimeter;
  cv.approxPolyDP(contour, approxPolygon, approxPolygonEpsilon, true);
  return approxPolygon;
}

/** Convenience wrapper of a cv.Mat representation of a polygon */
class Polygon {
  constructor(private readonly mat: cv.Mat) {}

  numVertices(): number {
    return this.mat.size().height;
  }

  getVertex(i: number): Coord2 {
    const x = this.mat.intAt(i, 0);
    const y = this.mat.intAt(i, 1);
    return { x, y };
  }

  aabb(): { topLeft: Coord2, width: number, height: number } {
    let { x: minX, y: minY } = this.getVertex(0);
    let maxX = minX;
    let maxY = minY;
    for (let i = 1; i < this.numVertices(); i += 1) {
      const v = this.getVertex(i);
      if (v.x < minX) {
        minX = v.x;
      }
      if (v.x > maxX) {
        maxX = v.x;
      }
      if (v.y < minY) {
        minY = v.y;
      }
      if (v.y > maxY) {
        maxY = v.y;
      }
    }
    const width = maxX - minX;
    const height = maxY - minY;
    return { topLeft: { x: minX, y: minY }, width, height };
  }

  isSquare(): boolean {
    return this.numVertices() === 4;
  }

  static approximateContour(contour: cv.Mat): Polygon {
    return new Polygon(approximatePolyOfContour(contour));
  }
}

/**
 * Returns true iff the given contour is an approximation of a quadrilateral
 */
function contourIsQuad(contour: cv.Mat): boolean {
  return Polygon.approximateContour(contour).numVertices() === 4;
}

/**
 * Returns the index of the contour which represents the border of the crossword
 */
function findCrosswordBorderContourIndex(contours: cv.MatVector): number {
  let ret = -1;
  let largestAreaSoFar = -Infinity;
  for (let i = 0; i < contours.size(); i += 1) {
    const contour = contours.get(i);
    if (contourIsQuad(contour)) {
      const area = cv.contourArea(contour);
      if (area > largestAreaSoFar) {
        largestAreaSoFar = area;
        ret = i;
      }
    }
  }
  return ret;
}

/** The position and shape of a strip of white squares */
export type ClueGeometry = { number: number, direction: 'across' | 'down', length: number, startGridCoord: Coord2 };

/**
 * A hierarchy of contours of an image, with priors that the image contains a crossword and policy for extracting
 * crossword-specific information from the image.
 */
export class ClueGeometryExtractor {
  private constructor(
    private readonly contours: cv.MatVector,
    private readonly hierarchy: cv.Mat,
    private readonly crosswordBorderIndex: number,
    private readonly inputImage: HTMLImageElement,
  ) {}

  /**
   * Returns the index of a given contour, specified by its index, according to a
   * contour hierarchy such as is returned by cv.findContours
   */
  contourParentIndex(contourIndex: number): number {
    return this.hierarchy.intPtr(0, contourIndex)[3];
  }

  isChildOfCrosswordBorder(contourIndex: number): boolean {
    return this.contourParentIndex(contourIndex) === this.crosswordBorderIndex;
  }

  static fromRawImageElement(image: HTMLImageElement): ClueGeometryExtractor {
    // make a cv.Mat containing the image pixel data
    const im = cv.imread(image);

    // copy of the image that we'll mutate to make the crossword easier to parse
    const tmp = im.clone();

    // convert the image to greyscale and invert the colours
    cv.cvtColor(tmp, tmp, cv.COLOR_BGR2GRAY);
    cv.bitwise_not(tmp, tmp);

    // build a hierarchy of contours in the image
    const contours = new cv.MatVector();
    const hierarchy = new cv.Mat();
    cv.findContours(tmp, contours, hierarchy, cv.RETR_TREE, cv.CHAIN_APPROX_SIMPLE);

    // find the index of the contour representing the boundary of the crossword
    const crosswordBorderIndex = findCrosswordBorderContourIndex(contours);

    // clean up
    im.delete();
    tmp.delete();

    return new ClueGeometryExtractor(contours, hierarchy, crosswordBorderIndex, image);
  }

  extractClueGeometry(): ClueGeometry[] {
    const CROSSWORD_GRID_SIDE_LENGTH = 15;
    const whiteCellsRowMajor = new Array(CROSSWORD_GRID_SIDE_LENGTH * CROSSWORD_GRID_SIDE_LENGTH);
    for (let i = 0; i < whiteCellsRowMajor.length; i += 1) {
      whiteCellsRowMajor[i] = false;
    }
    const crosswordBorderPolygon = Polygon.approximateContour(this.contours.get(this.crosswordBorderIndex));
    const crosswordBorderAabb = crosswordBorderPolygon.aabb();
    for (let i = 0; i < this.contours.size(); i += 1) {
      const contourPolygon = Polygon.approximateContour(this.contours.get(i));
      if (contourPolygon.isSquare()) {
        if (this.isChildOfCrosswordBorder(i)) {
          const aabb = contourPolygon.aabb();
          const crosswordRelativeTopLeft = coord2.sub(aabb.topLeft, crosswordBorderAabb.topLeft);
          const gridCoordX = Math.floor(
            (CROSSWORD_GRID_SIDE_LENGTH * crosswordRelativeTopLeft.x) / crosswordBorderAabb.width
          );
          const gridCoordY = Math.floor(
            (CROSSWORD_GRID_SIDE_LENGTH * crosswordRelativeTopLeft.y) / crosswordBorderAabb.height
          );
          whiteCellsRowMajor[(gridCoordY * CROSSWORD_GRID_SIDE_LENGTH) + gridCoordX] = true;
        }
      }
    }
    let nextClueNumber = 1;
    const clues: ClueGeometry[] = [];
    for (let i = 0; i < CROSSWORD_GRID_SIDE_LENGTH; i += 1) {
      for (let j = 0; j < CROSSWORD_GRID_SIDE_LENGTH; j += 1) {
        const currentCellIsWhite = whiteCellsRowMajor[(i * CROSSWORD_GRID_SIDE_LENGTH) + j];
        if (currentCellIsWhite) {
          const startGridCoord = { x: j, y: i };
          const rightCellIsWhite = j < CROSSWORD_GRID_SIDE_LENGTH - 1
          && whiteCellsRowMajor[(i * CROSSWORD_GRID_SIDE_LENGTH) + (j + 1)];
          const belowCellIsWhite = i < CROSSWORD_GRID_SIDE_LENGTH - 1
          && whiteCellsRowMajor[((i + 1) * CROSSWORD_GRID_SIDE_LENGTH) + j];
          const leftCellIsNotWhite = j === 0
          || !whiteCellsRowMajor[(i * CROSSWORD_GRID_SIDE_LENGTH) + (j - 1)];
          const aboveCellIsNotWhite = i === 0
          || !whiteCellsRowMajor[((i - 1) * CROSSWORD_GRID_SIDE_LENGTH) + j];
          const acrossStart = leftCellIsNotWhite && rightCellIsWhite;
          const downStart = aboveCellIsNotWhite && belowCellIsWhite;
          if (acrossStart) {
            let k = j + 1;
            while (k < CROSSWORD_GRID_SIDE_LENGTH) {
              if (!whiteCellsRowMajor[(i * CROSSWORD_GRID_SIDE_LENGTH) + k]) {
                break;
              }
              k += 1;
            }
            const length = k - j;
            clues.push({
              number: nextClueNumber,
              direction: 'across',
              length,
              startGridCoord,
            });
          }
          if (downStart) {
            let k = i + 1;
            while (k < CROSSWORD_GRID_SIDE_LENGTH) {
              if (!whiteCellsRowMajor[(k * CROSSWORD_GRID_SIDE_LENGTH) + j]) {
                break;
              }
              k += 1;
            }
            const length = k - i;
            clues.push({
              number: nextClueNumber,
              direction: 'down',
              length,
              startGridCoord,
            });
          }
          if (acrossStart || downStart) {
            nextClueNumber += 1;
          }
        }
      }
    }
    return clues;
  }

  drawDebugImage(canvasId: string): void {
    const im = cv.imread(this.inputImage);

    // copy of the image which we'll draw debugging lines on
    const debug = im.clone();

    // draw borders around the white squares of the crossword
    for (let i = 0; i < this.contours.size(); i += 1) {
      if (contourIsQuad(this.contours.get(i))) {
        if (this.isChildOfCrosswordBorder(i)) {
          cv.drawContours(debug, this.contours, i, [255, 0, 0, 255], 2);
        }
      }
    }

    // draw the crossword border
    cv.drawContours(debug, this.contours, this.crosswordBorderIndex, [0, 255, 0, 255], 2);

    // draw the debugging image on a canvas element
    cv.imshow(canvasId, debug);

    // clean up
    im.delete();
    debug.delete();
  }
}
