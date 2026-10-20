"use client";

import { useEffect, useState, type FC, type ReactNode } from "react";
import styles from "./screen-effects.module.css";

// Fıçı (barrel) bükülme haritası: R/G kanalları her pikselin x/y kaymasını taşır.
// 128 = kayma yok; merkeze yakın pikseller içeri doğru örneklenir → merkez büyür, kenar sıkışır.
const buildBulgeMap = (size = 128): string => {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(size, size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = (x / (size - 1)) * 2 - 1;
      const cy = (y / (size - 1)) * 2 - 1;
      const falloff = Math.max(0, 1 - (cx * cx + cy * cy));
      const i = (y * size + x) * 4;
      img.data[i] = 128 - 127 * cx * falloff;
      img.data[i + 1] = 128 - 127 * cy * falloff;
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas.toDataURL();
};

// Harita hazır olana kadar filtre uygulanmaz; yoksa ilk karede içerik kayar.
export const CrtTube: FC<{ className?: string; children: ReactNode }> = ({
  className,
  children,
}) => {
  const [map, setMap] = useState("");
  useEffect(() => setMap(buildBulgeMap()), []);

  return (
    <>
      {map && (
        <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden="true">
          <filter
            id="crt-bulge"
            x="0"
            y="0"
            width="1"
            height="1"
            primitiveUnits="objectBoundingBox"
            colorInterpolationFilters="sRGB"
          >
            <feImage href={map} x="0" y="0" width="1" height="1" preserveAspectRatio="none" result="map" />
            {/* ponytail: bükülme miktarı; 0.05 hafif, 0.12 belirgin */}
            <feDisplacementMap in="SourceGraphic" in2="map" scale="0.08" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
      )}
      <div className={className} style={map ? { filter: "url(#crt-bulge)" } : undefined}>
        {children}
      </div>
    </>
  );
};

// Tüp üstündeki katmanlar; sıra = çizim sırası
const LAYERS = [
  "screenFlicker",
  "scanlines",
  "crtOverlay",
  "radialGradient",
  "screenNoise",
  "chromaticAberration",
  "colorBleeding",
  "horizontalDistortion",
  "refreshBar",
  "crtVignette",
] as const;

export const ScreenEffects = () => (
  <>
    {LAYERS.map((k) => (
      <div key={k} className={styles[k]} aria-hidden="true" />
    ))}
  </>
);
