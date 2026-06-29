"use client";

import { useState } from "react";
import EditCommunityForm from "./EditCommunityForm";
import type { Community } from "@/lib/types";

export default function CommunityCard({
  community,
  villaCount,
}: {
  community: Community;
  villaCount: number;
}) {
  const [editing, setEditing] = useState(false);
  const query = community.location_description
    ? encodeURIComponent(community.location_description)
    : null;

  return (
    <div className="rounded-card bg-white border border-line p-5">
      <div className="flex items-start justify-between">
        <h2 className="text-lg font-bold">{community.name}</h2>
        <button
          onClick={() => setEditing((e) => !e)}
          className="text-sm text-blue-600 font-medium"
        >
          {editing ? "Close" : "Edit"}
        </button>
      </div>
      <p className="text-sm text-gray-500 mt-1">{community.location_description}</p>
      <p className="text-sm text-gray-600 mt-2">{villaCount} villas</p>

      {editing ? (
        <EditCommunityForm community={community} />
      ) : query ? (
        <>
          <iframe
            className="mt-3 w-full rounded-lg border"
            height="180"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={`https://www.google.com/maps?q=${query}&output=embed`}
          />
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${query}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-block text-sm text-blue-600 font-medium"
          >
            Open in Google Maps →
          </a>
        </>
      ) : (
        <p className="mt-3 text-sm text-gray-400">
          No location set — add one to see it on a map.
        </p>
      )}
    </div>
  );
}
