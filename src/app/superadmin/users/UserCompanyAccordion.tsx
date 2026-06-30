"use client";

import { useState } from "react";

const ROLE_STYLE: Record<string, string> = {
  admin:   "bg-blue-100 text-blue-700",
  cleaner: "bg-green-100 text-green-700",
};

const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface UserData {
  id: string;
  name: string;
  role: string;
  email: string;
  communities: { id: string; name: string }[];
  villas: number;
  cars: number;
  bookOfBusiness: number;
  schedules: { villa: string; days: number[]; price: number }[];
}

export interface CompanyData {
  id: string;
  name: string;
  status: string;
  users: UserData[];
}

export default function UserCompanyAccordion({ companies }: { companies: CompanyData[] }) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set(companies.map((c) => c.id)));

  function toggle(id: string) {
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      {companies.map((company) => {
        const isOpen = openIds.has(company.id);
        return (
          <div key={company.id} className="rounded-card bg-white border border-line overflow-hidden">
            {/* Clickable header */}
            <button
              onClick={() => toggle(company.id)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  className={`transition-transform duration-200 text-gray-400 shrink-0 ${isOpen ? "rotate-90" : ""}`}
                >
                  <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div>
                  <p className="font-bold text-sm">{company.name}</p>
                  <p className="text-xs text-muted">{company.users.length} user{company.users.length !== 1 ? "s" : ""}</p>
                </div>
              </div>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                company.status === "active"    ? "bg-green-100 text-green-700"   :
                company.status === "pending"   ? "bg-yellow-100 text-yellow-700" :
                                                 "bg-red-100 text-red-700"
              }`}>
                {company.status === "active" ? "Active" : company.status === "pending" ? "Pending" : "Suspended"}
              </span>
            </button>

            {/* Collapsible user list */}
            {isOpen && (
              <div className="divide-y divide-line">
                {company.users.map((emp) => (
                  <div key={emp.id} className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center font-bold text-sm text-gray-600 shrink-0">
                          {emp.name?.[0] ?? "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{emp.name}</p>
                          {emp.email && <p className="text-xs text-muted">{emp.email}</p>}
                        </div>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${ROLE_STYLE[emp.role] ?? "bg-gray-100 text-gray-600"}`}>
                        {emp.role}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                      {[
                        { label: "Communities", val: emp.communities.length },
                        { label: "Villas",      val: emp.villas },
                        { label: "Cars",        val: emp.cars },
                        { label: "Book of business", val: emp.bookOfBusiness > 0 ? `AED ${emp.bookOfBusiness.toLocaleString()}` : "—" },
                      ].map((s) => (
                        <div key={s.label} className="bg-canvas rounded-control px-3 py-2">
                          <p className="text-xs text-muted">{s.label}</p>
                          <p className="font-bold text-sm">{s.val}</p>
                        </div>
                      ))}
                    </div>

                    {emp.communities.length > 0 && (
                      <div className="mb-2">
                        <p className="text-xs text-muted font-semibold uppercase tracking-wide mb-1.5">Communities</p>
                        <div className="flex flex-wrap gap-1.5">
                          {emp.communities.map((c) => (
                            <span key={c.id} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {emp.schedules.length > 0 && (
                      <div>
                        <p className="text-xs text-muted font-semibold uppercase tracking-wide mb-1.5">Active schedules</p>
                        <div className="flex flex-wrap gap-1.5">
                          {emp.schedules.map((s, i) => (
                            <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                              Villa {s.villa} · {s.days.map((d) => WEEKDAY_LABELS[d]).join("/")} · AED {s.price}/mo
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {emp.role === "admin" && emp.communities.length === 0 && (
                      <p className="text-xs text-muted italic">Manages all communities in this company</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
