import CleanerNav from "@/components/CleanerNav";
import InstallPrompt from "@/components/InstallPrompt";
import { LanguageProvider } from "@/lib/LanguageContext";

export default function CleanerLayout({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <div className="min-h-screen max-w-md mx-auto bg-canvas">
        <CleanerNav />
        <main className="p-4 pb-24 space-y-3">{children}</main>
        <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+64px)] left-0 right-0 max-w-md mx-auto z-20">
          <InstallPrompt />
        </div>
      </div>
    </LanguageProvider>
  );
}
