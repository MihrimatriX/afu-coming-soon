import dynamic from "next/dynamic";

// Three.js paketleri ağır: yalnızca masaüstünde ve WebGL varsa yüklenir
export const CrtScene = dynamic(() => import("./crt-scene").then((m) => m.CrtScene), {
  ssr: false,
  loading: () => null,
});
