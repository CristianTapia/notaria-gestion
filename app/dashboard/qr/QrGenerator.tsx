"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

type TenantRow = {
  id: string;
  slug: string;
  name: string;
};

export default function QrGenerator({ tenant }: { tenant: TenantRow }) {
  const [qr, setQr] = useState("");

  const publicUrl = `${window.location.origin}/c/${tenant.slug}`;

  useEffect(() => {
    QRCode.toDataURL(publicUrl).then(setQr).catch(console.error);
  }, [publicUrl]);

  return (
    <div className="mt-6 rounded-xl border p-6">
      <h2 className="font-semibold">Portal Cliente</h2>

      <p className="mt-2 text-sm text-gray-500 break-all">{publicUrl}</p>

      {qr && (
        <>
          <img src={qr} alt="QR" className="mt-4 w-64" />

          <a href={qr} download={`${tenant.slug}.png`} className="mt-4 inline-block rounded-md border px-4 py-2">
            Descargar QR
          </a>
        </>
      )}
    </div>
  );
}
