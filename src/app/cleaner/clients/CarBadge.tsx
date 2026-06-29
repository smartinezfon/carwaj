"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CAR_CATALOG, CAR_MAKES } from "@/lib/carCatalog";
import type { Car } from "@/lib/types";

export default function CarBadge({ car }: { car: Car }) {
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [make, setMake] = useState(CAR_MAKES.includes(car.make) ? car.make : "Other");
  const [model, setModel] = useState(car.model);
  const [color, setColor] = useState(car.color ?? "");
  const [plateNumber, setPlateNumber] = useState(car.plate_number ?? "");
  const [busy, setBusy] = useState(false);

  const modelOptions = CAR_CATALOG[make] ?? CAR_CATALOG.Other;
  const isCustomModel = !modelOptions.includes(model);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await supabase
      .from("cars")
      .update({ make, model, color: color || null, plate_number: plateNumber || null })
      .eq("id", car.id);
    setBusy(false);
    setEditing(false);
    router.refresh();
  }

  async function handleDelete() {
    if (!confirm(`Remove ${car.make} ${car.model}?`)) return;
    setBusy(true);
    await supabase.from("cars").delete().eq("id", car.id);
    setBusy(false);
    router.refresh();
  }

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 min-h-11"
      >
        🚗 {car.color} {car.make} {car.model}
        {car.plate_number ? ` · ${car.plate_number}` : ""}
        <span className="text-gray-400">✎</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSave}
      className="w-full space-y-2 rounded-lg border bg-gray-50 p-3"
    >
      <div className="grid grid-cols-2 gap-2">
        <select
          value={make}
          onChange={(e) => {
            setMake(e.target.value);
            setModel(CAR_CATALOG[e.target.value][0]);
          }}
          className="rounded border px-2 py-2.5 text-sm min-h-11"
        >
          {CAR_MAKES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={isCustomModel ? "Other" : model}
          onChange={(e) => setModel(e.target.value === "Other" ? "" : e.target.value)}
          className="rounded border px-2 py-2.5 text-sm min-h-11"
        >
          {modelOptions.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>
      {(isCustomModel || model === "") && (
        <input
          required
          placeholder="Model name"
          value={model}
          onChange={(e) => setModel(e.target.value)}
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
          placeholder="Plate"
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
          Save
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={busy}
          className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 min-h-11"
        >
          Delete
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-lg border px-4 py-2.5 text-sm font-medium text-gray-600 min-h-11"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
