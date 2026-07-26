import Link from "next/link";

export function CarLogo({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M3.6 15.2l1.5-3.9A2.5 2.5 0 0 1 7.4 9.6h7.2a2.5 2.5 0 0 1 2.3 1.6l1.5 3.9" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3 15.2h16v2a1 1 0 0 1-1 1h-.3a1 1 0 0 1-1-1v-.2H5.3v.2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round"/>
      <circle cx="7.3" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
      <circle cx="14.7" cy="16.1" r="1.3" fill="#2563eb" stroke="#fff" strokeWidth="1.2"/>
      <path d="M19.4 4.2C19.6 5.9 20.1 6.4 21.8 6.6C20.1 6.8 19.6 7.3 19.4 9C19.2 7.3 18.7 6.8 17 6.6C18.7 6.4 19.2 5.9 19.4 4.2Z" fill="#fff"/>
    </svg>
  );
}

/**
 * Shared shell for the auth screens, matching the Figma "Auth" frames.
 * The login page predates this and keeps its own copy of the markup — it is
 * working, heavily-trafficked code and not worth the churn of a refactor.
 */
export default function AuthCard({
  title,
  subtitle,
  mark = "logo",
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  mark?: "logo" | "mail" | "alert";
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-4 py-10">
      <div className="w-full max-w-[392px] rounded-[22px] bg-white border border-line p-[38px_34px] shadow-[0_24px_60px_-32px_rgba(15,23,42,.32)]">
        {mark === "logo" && (
          <div className="w-12 h-12 rounded-[15px] bg-blue-600 flex items-center justify-center mb-[22px] shadow-[0_10px_22px_-8px_rgba(37,99,235,.55)]">
            <CarLogo size={27} />
          </div>
        )}
        {mark === "mail" && (
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-[22px]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="#2563eb" strokeWidth="1.7"/>
              <path d="M4 7l8 5 8-5" stroke="#2563eb" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        {mark === "alert" && (
          <div className="w-12 h-12 rounded-full bg-cancelled-bg flex items-center justify-center mb-[22px]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="9" stroke="#ef4444" strokeWidth="1.7"/>
              <path d="M12 7v5M12 16.5h.01" stroke="#ef4444" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
          </div>
        )}

        <h1 className="text-[25px] font-extrabold tracking-[-0.025em] m-0 text-ink">{title}</h1>
        <p className="mt-[7px] mb-7 text-muted text-[14.5px] leading-relaxed">{subtitle}</p>

        {children}
      </div>

      {footer ?? (
        <p className="mt-[22px] text-[12.5px]">
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700">
            Back to sign in
          </Link>
        </p>
      )}
    </div>
  );
}

/** Bordered field wrapper matching the login page inputs. */
export function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: "mail" | "lock";
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="block text-[12.5px] font-semibold text-[#4a5563] mb-[7px]">{label}</label>
      <div className="flex items-center gap-[9px] border border-[#dde3ea] rounded-[12px] px-[13px] h-[46px] bg-[#fbfcfd] focus-within:border-blue-500">
        {icon === "mail" ? (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="#9aa3af" strokeWidth="1.7"/>
            <path d="M4 7l8 5 8-5" stroke="#9aa3af" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        ) : (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <rect x="5" y="11" width="14" height="9" rx="2" stroke="#9aa3af" strokeWidth="1.7"/>
            <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="#9aa3af" strokeWidth="1.7" strokeLinecap="round"/>
          </svg>
        )}
        {children}
      </div>
    </div>
  );
}

export const inputClass =
  "flex-1 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-[#9aa3af]";

export const submitClass =
  "w-full h-12 mt-6 rounded-[12px] bg-blue-600 hover:bg-[#1d4ed8] text-white font-bold text-[15px] " +
  "disabled:opacity-50 shadow-[0_8px_20px_-6px_rgba(37,99,235,.5)] transition-colors";
