import cv from '@techstark/opencv-js';
import { loadImage } from './util';

cv.onRuntimeInitialized = async () => {
  const sample = await loadImage('/samples/smh-cryptic-2020-07-16.png');
  const im = cv.imread(sample);
  cv.imshow('debugCanvas', im);
};
