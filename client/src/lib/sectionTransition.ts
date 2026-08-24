export const sectionTransitionEvent = "signal-atelier-section-transition";

export function requestSectionTransition(id: string) {
  window.dispatchEvent(new CustomEvent(sectionTransitionEvent, { detail: { id } }));
}
