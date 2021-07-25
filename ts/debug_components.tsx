import React from 'react';
import { ClueGeometry } from './clue_geometry';

/**
 * Debugging component for listing the clue geometry
 */
export const DebugClueGeometryComponent = ({ clueGeometry }: { clueGeometry: ClueGeometry[] }): JSX.Element => <div>
  <table><tbody><tr>
  <td>
  <h2>Across</h2>
  <ul>
  { clueGeometry.filter((c) => c.direction === 'across')
    .map((c, i) => <li key={i}><strong>{c.number}.</strong> ({c.length})</li>)
  }
  </ul>
  </td>
  <td>
  <h2>Down</h2>
  <ul>
  { clueGeometry.filter((c) => c.direction === 'down')
    .map((c, i) => <li key={i}><strong>{c.number}.</strong> ({c.length})</li>)
  }
  </ul>
  </td>
  </tr></tbody></table>
  </div>;
