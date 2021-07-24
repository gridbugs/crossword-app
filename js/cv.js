import * as cv from './opencv';
export {
  Mat,
  MatVector,
  imread,
  imshow,
  cvtColor,
  bitwise_not,
  findContours,
  arcLength,
  approxPolyDP,
  contourArea,
  drawContours,
  COLOR_BGR2GRAY,
  RETR_TREE,
  CHAIN_APPROX_SIMPLE,
} from './opencv';

export function callOnRuntimeInitialized(f) {
  cv.onRuntimeInitialized = f;
}
