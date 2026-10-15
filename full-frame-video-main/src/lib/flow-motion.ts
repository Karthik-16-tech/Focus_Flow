export function wrapFlowOffset(offset: number, width: number): number {
  if (width <= 0) return 0;
  return (((offset + width / 2) % width) + width) % width - width / 2;
}

export function flowPointerDelta(delta: number, dragging: boolean): number {
  return delta * (dragging ? 1 : 0.45);
}
