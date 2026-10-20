import { useEffect, useState } from "react";

const hasWebGL = () => {
  try {
    const gl = document.createElement("canvas").getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
    return !!gl;
  } catch {
    return false;
  }
};

// null: henüz bilinmiyor (SSR / ilk render). true: gerçek 3B sahne. false: CSS sürümü.
export const useScene3d = (): boolean | null => {
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 641px)");
    const update = () => setOn(mq.matches && hasWebGL());
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return on;
};
