"use client";

import { useState, useTransition } from "react";
import { removeAdmin } from "@/lib/admin/admins-actions";

export function RemoveAdminButton({ userId, name }: { userId: string; name: string }) {
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string>();
  return (
    <span className="inline-flex items-center gap-3">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(`${name} admin siyahısından çıxarılsın?`)) return;
          start(async () => {
            const result = await removeAdmin(userId);
            setMessage(result.status === "error" ? result.message : undefined);
          });
        }}
        className="rounded-pill px-3 py-1.5 text-small text-danger hover:bg-danger/10 disabled:opacity-60"
      >
        {pending ? "Silinir…" : "Çıxar"}
      </button>
      {message && (
        <span role="alert" className="text-caption text-danger">
          {message}
        </span>
      )}
    </span>
  );
}
