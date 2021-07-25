import React from 'react';
import ReactDOM from 'react-dom';
import * as cv from '../js/cv';
import { loadImage } from './util';
import { ClueGeometryExtractor } from './clue_geometry';
import { DebugClueGeometryComponent } from './debug_components';

cv.callOnRuntimeInitialized(async () => {
  // load an image
  const sample = await loadImage('samples/smh-cryptic-2020-07-16.png');

  // extract clue geometry
  const clueGeometryExtractor = ClueGeometryExtractor.fromRawImageElement(sample);
  const clueGeometry = clueGeometryExtractor.extractClueGeometry();
  clueGeometryExtractor.drawDebugImage('debugCanvas');

  ReactDOM.render(
    <div>
    <DebugClueGeometryComponent clueGeometry={clueGeometry} />
    </div>,
    document.getElementById('root')
  );
});
