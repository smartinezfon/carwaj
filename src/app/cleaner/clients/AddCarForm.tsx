"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CAR_CATALOG, CAR_MAKES } from "@/lib/carCatalog";

export default function AddCarForm({ villaId }: { villaId: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [make, setMake] = useState(CAR_MAKES[0]);
  const [model, setModel] = useState(CAR_CATALOG[CAR_MAKES[0]][0]);
  const [customModel, setCustomModel] = useState("");
  const [color, setColor] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [busy, setBusy] = useState(false);

  function handleMakeChange(newMake: string) {
    setMake(newMake);
    setModel(CAR_CATALOG[newMake][0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const finalModel = model === "Other" ? customModel : model;
    await supabase.from("cars").insert({
      villa_id: villaId,
      make,
      model: finalModel,
      color: color || null,
      plate_number: plateNumber || null,
    });
    setBusy(false);
    setOpen(false);
    setMake(CAR_MAKES[0]);
    setModel(CAR_CATALOG[CAR_MAKES[0]][0]);
    setCustomModel("");
    setColor("");
    setPlateNumber("");
    router.refresh();
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-left text-sm text-blue-600 font-semibold py-2.5 min-h-11"
      >
        + Add car
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 rounded-lg border bg-gray-50 p-3">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={make}
          onChange={(e) => handleMakeChange(e.target.value)}
          className="rounded border px-2 py-2.5 text-sm min-h-11"
        >
          {CAR_MAKES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="rounded border px-2 py-2.5 text-sm min-h-11"
        >
          {CAR_CATALOG[make].map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      {model === "Other" && (
        <input
          required
          placeholder="Model name"
          value={customModel}
          onChange={(e) => setCustomModel(e.target.value)}
          className="w-full rounded border px-2 py-2.5 text-sm min-h-11"
        />
      )}
      <div className="grid grid-cols-2 gap-2">
        <input
          placeholder="Color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="rounded border px-2 py-2.5 text-sm min-h-11"
        />
        <input
          placeholder="Plate number"
          value={plateNumber}
          onChange={(e) => setPlateNumber(e.target.value)}
          className="rounded border px-2 py-2.5 text-sm min-h-11"
        />
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white disabled:opacity-50 min-h-11"
        >
          Save Car
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-600 min-h-11"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
