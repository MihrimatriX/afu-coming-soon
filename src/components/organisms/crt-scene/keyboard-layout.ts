// Klavye tuş düzeni: hem 3B tuşların konumu hem de tuş yazıları buradan gelir.
// Birimler metre; x merkezden sağa, z klavyenin arkasından öne doğru.

export const PITCH = 0.02;
export const KB_W = 15 * PITCH;

export type KeyDef = { label: string; x: number; z: number; w: number; d: number; dark: boolean };

type K = [label: string, width?: number, dark?: boolean];
const chars = (s: string): K[] => [...s].map((c) => [c]);

const ROWS: K[][] = [
  [["ESC", 1.5, true], ...Array.from({ length: 12 }, (_, i): K => [`F${i + 1}`]), ["DEL", 1.5, true]],
  [...chars("`1234567890-="), ["BKSP", 2, true]],
  [["TAB", 1.5, true], ...chars("QWERTYUIOP[]"), ["\\", 1.5]],
  [["CAPS", 1.75, true], ...chars("ASDFGHJKL;'"), ["ENTER", 2.25, true]],
  [["SHIFT", 2.25, true], ...chars("ZXCVBNM,./"), ["SHIFT", 2.75, true]],
  [["CTRL", 2, true], ["ALT", 2, true], ["", 7], ["ALT", 2, true], ["CTRL", 2, true]],
];

export const buildKeys = (): { keys: KeyDef[]; depth: number } => {
  const keys: KeyDef[] = [];
  let z = 0;
  for (const [r, row] of ROWS.entries()) {
    const d = (r === 0 ? 0.8 : 1) * PITCH;
    let x = -KB_W / 2;
    for (const [label, w = 1, dark = false] of row) {
      keys.push({ label, x: x + (w * PITCH) / 2, z: z + d / 2, w: w * PITCH, d, dark });
      x += w * PITCH;
    }
    z += d;
  }
  return { keys, depth: z };
};
