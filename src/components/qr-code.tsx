import { useEffect, useState } from "react";

/** QR Code gerado no navegador (biblioteca carregada sob demanda). */
export function QrCode({ value, size = 132 }: { value: string; size?: number }) {
  const [src, setSrc] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    void import("qrcode").then((q) => q.toDataURL(value, { width: size * 2, margin: 1 })).then((u) => { if (alive) setSrc(u); }).catch(() => null);
    return () => { alive = false; };
  }, [value, size]);
  return src ? <img className="qr-code" src={src} width={size} height={size} alt={`QR Code de ${value}`} /> : <span className="qr-code" style={{ width: size, height: size }} aria-hidden />;
}
