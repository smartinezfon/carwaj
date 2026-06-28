"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MarkPaidButton({ paymentId }: { paymentId: string }) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function markPaid() {
    setBusy(true);
    await supabase.from("payments").update({ status: "paid" }).eq("id", paymentId);
    setBusy(false);
    router.refresh();
  }

  return (
    <button
      onClick={markPaid}
      disabled={busy}
      className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
    >
      Mark Paid
    </button>
  );
}
