export type Coord2 = { readonly x: number, readonly y: number };

export function sub(a: Coord2, b: Coord2): Coord2 {
  return { x: a.x - b.x, y: a.y - b.y };
}
