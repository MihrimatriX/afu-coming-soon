// 3B sahnenin açılış aşamaları. Yükleme ekranı (statik paket) ile sahne (ayrı, geç yüklenen paket)
// arasında köprü: sahne ilerledikçe yazar, yükleme ekranı dinler.

export type Boot = {
  kernel: boolean; // three.js paketi indi ve çalıştı
  textures: [done: number, total: number];
  shaders: [done: number, total: number];
  ready: boolean; // ilk kareler çizildi
};

let state: Boot = { kernel: false, textures: [0, 0], shaders: [0, 0], ready: false };
const subs = new Set<() => void>();

export const bootProgress = {
  get: () => state,
  set: (patch: Partial<Boot>) => {
    state = { ...state, ...patch };
    subs.forEach((f) => f());
  },
  subscribe: (f: () => void) => {
    subs.add(f);
    return () => void subs.delete(f);
  },
};

// Toplam ilerleme 0..1: çekirdek %20, dokular %25, shader'lar %50, ilk kare %5
export const bootRatio = (b: Boot) => {
  const frac = ([d, t]: [number, number]) => (t ? d / t : 0);
  return (b.kernel ? 0.2 : 0) + frac(b.textures) * 0.25 + frac(b.shaders) * 0.5 + (b.ready ? 0.05 : 0);
};
