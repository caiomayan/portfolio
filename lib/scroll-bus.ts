/** O Lenis (components/smooth-scroll.tsx) avisa aqui a cada quadro de rolagem; o ScrollTrigger (lib/choreography.ts) escuta, pra andar junto com ele. */
type Listener = () => void;
const listeners = new Set<Listener>();
export const onLenisScroll = (l: Listener) => {
  listeners.add(l);
  return () => void listeners.delete(l);
};
export const emitLenisScroll = () => listeners.forEach((l) => l());
