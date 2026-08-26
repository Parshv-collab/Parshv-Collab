export type ProjectDialogSwipeMetrics = {
  offset: { y: number };
  velocity: { y: number };
};

export function shouldDismissProjectDialog({ offset, velocity }: ProjectDialogSwipeMetrics) {
  return offset.y > 96 || velocity.y > 560;
}
