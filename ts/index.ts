import cv from '@techstark/opencv-js';
import { loadImage } from './util';

/**
 * Returns true iff the given contour is an approximation of a quadrilateral
 */
function contourIsQuad(contour: cv.Mat): boolean {
  const APPROX_POLYGON_EPS_RATIO_OF_PERIMETER = 0.02;
  const perimeter = cv.arcLength(contour, true);
  const approxPolygon = new cv.Mat();
  const approxPolygonEpsilon = APPROX_POLYGON_EPS_RATIO_OF_PERIMETER * perimeter;
  cv.approxPolyDP(contour, approxPolygon, approxPolygonEpsilon, true);
  const numVertices = approxPolygon.size().height;
  return numVertices === 4;
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

/**
 * Returns the index of a given contour, specified by its index, according to a
 * contour hierarchy such as is returned by cv.findContours
 */
function contourParentIndex(contourIndex: number, hierarchy: cv.Mat): number {
  return hierarchy.intPtr(0, contourIndex)[3];
}

cv.onRuntimeInitialized = async () => {
  // load an image
  const sample = await loadImage('/samples/smh-cryptic-2020-07-16.png');

  // make a cv.Mat containing the image pixel data
  const im = cv.imread(sample);

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

  // another copy of the image which we'll draw debugging lines on
  const debug = im.clone();

  // draw borders around the white squares of the crossword
  for (let i = 0; i < contours.size(); i += 1) {
    if (contourIsQuad(contours.get(i))) {
      if (contourParentIndex(i, hierarchy) === crosswordBorderIndex) {
        cv.drawContours(debug, contours, i, [255, 0, 0, 255], 2);
      }
    }
  }

  // draw the crossword border
  cv.drawContours(debug, contours, crosswordBorderIndex, [0, 255, 0, 255], 2);

  // draw the debugging image on a canvas element
  cv.imshow('debugCanvas', debug);

  // clean up
  im.delete();
  tmp.delete();
  debug.delete();
};
