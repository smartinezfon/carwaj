import CleanerNav from "@/components/CleanerNav";

export default function CleanerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen max-w-md mx-auto bg-canvas">
      <CleanerNav />
      <main className="p-4 pb-24 space-y-3">{children}</main>
    </div>
  );
}
