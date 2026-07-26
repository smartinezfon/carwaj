"use client";

import { useEffect, useId, useState } from "react";
import {
  DUBAI_COMMUNITIES,
  OTHER_AREAS,
  PRIORITY_AREAS,
  communityLocation,
  communityName,
} from "@/lib/dubaiCommunities";

export const OTHER = "__other__";

export interface PickedCommunity {
  name: string;
  location: string;
}

// Communities created before the picker existed have free-text names, so match
// the stored name back onto the catalog. No match leaves the selects empty.
function matchArea(name: string | undefined): string {
  if (!name) return "";
  for (const [area, subs] of Object.entries(DUBAI_COMMUNITIES)) {
    if (area === name || subs.includes(name)) return area;
  }
  return "";
}

/**
 * Area → community dropdowns, shared by the new and edit forms. Free text only
 * appears once "Other" is picked, so everything else stays on the catalog.
 * Calls onChange with null while the selection is incomplete.
 */
export default function CommunityPicker({
  initialName,
  onChange,
  size = "md",
}: {
  initialName?: string;
  onChange: (value: PickedCommunity | null) => void;
  size?: "sm" | "md";
}) {
  const initialArea = matchArea(initialName);
  const [area, setArea] = useState(initialArea);
  const [subCommunity, setSubCommunity] = useState(
    initialArea && initialName !== initialArea ? initialName! : ""
  );
  const [customArea, setCustomArea] = useState("");
  const [customCommunity, setCustomCommunity] = useState("");
  const uid = useId();

  const areaIsOther = area === OTHER;
  const resolvedArea = areaIsOther ? customArea.trim() : area;
  const resolvedCommunity =
    areaIsOther || subCommunity === OTHER ? customCommunity.trim() : subCommunity;
  const subCommunities = areaIsOther ? [] : DUBAI_COMMUNITIES[area] ?? [];

  useEffect(() => {
    if (!resolvedArea) {
      onChange(null);
      return;
    }
    onChange({
      name: communityName(resolvedArea, resolvedCommunity),
      location: communityLocation(resolvedArea, resolvedCommunity),
    });
  }, [resolvedArea, resolvedCommunity, onChange]);

  function handleAreaChange(newArea: string) {
    setArea(newArea);
    setSubCommunity("");
    setCustomCommunity("");
  }

  const field =
    size === "sm"
      ? "w-full rounded border px-2 py-2 text-sm min-h-11"
      : "w-full rounded-lg border px-3 py-2 min-h-11";
  const label = size === "sm" ? "sr-only" : "block text-sm font-medium mb-1";

  return (
    <div className="space-y-2">
      {initialName && !initialArea && (
        <p className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-800">
          &ldquo;{initialName}&rdquo; isn&apos;t in the Dubai list — pick its area and community below.
        </p>
      )}
      <div>
        <label className={label} htmlFor={`${uid}-area`}>
          Area
        </label>
        <select
          id={`${uid}-area`}
          value={area}
          onChange={(e) => handleAreaChange(e.target.value)}
          className={field}
        >
          <option value="" disabled>
            Select area
          </option>
          <optgroup label="Main areas">
            {PRIORITY_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </optgroup>
          <optgroup label="All Dubai areas">
            {OTHER_AREAS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </optgroup>
          <option value={OTHER}>Other — not listed</option>
        </select>
      </div>
      {areaIsOther ? (
        <>
          <input
            required
            value={customArea}
            onChange={(e) => setCustomArea(e.target.value)}
            placeholder="Area name"
            className={field}
          />
          <input
            value={customCommunity}
            onChange={(e) => setCustomCommunity(e.target.value)}
            placeholder="Community name (optional)"
            className={field}
          />
        </>
      ) : (
        <div>
          <label className={label} htmlFor={`${uid}-community`}>
            Community
          </label>
          <select
            id={`${uid}-community`}
            value={subCommunity}
            onChange={(e) => setSubCommunity(e.target.value)}
            disabled={!area}
            className={`${field} disabled:bg-gray-100`}
          >
            <option value="">{area ? `${area} — whole area` : "Select community"}</option>
            {subCommunities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            {area && <option value={OTHER}>Other — not listed</option>}
          </select>
          {subCommunity === OTHER && (
            <input
              required
              value={customCommunity}
              onChange={(e) => setCustomCommunity(e.target.value)}
              placeholder="Community name"
              className={`${field} mt-2`}
            />
          )}
        </div>
      )}
    </div>
  );
}
