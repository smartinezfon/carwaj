import { createAdminClient } from "@/lib/supabase/admin";
import OnboardingForm from "./OnboardingForm";

export default async function OnboardingPage({ params }: { params: { token: string } }) {
  const supabase = createAdminClient();

  const { data: villa } = await supabase
    .from("villas")
    .select("id, owner_name, villa_number, onboarding_expires_at, onboarding_submitted_at, community:communities(name)")
    .eq("onboarding_token", params.token)
    .single();

  if (!villa) {
    return <StatusPage icon="❌" title="Link not found" message="This link is invalid or has already been used." />;
  }

  if (villa.onboarding_submitted_at) {
    return <StatusPage icon="✅" title="Already submitted" message="Your details have been received. Your cleaner will be in touch soon!" />;
  }

  const expired = !villa.onboarding_expires_at || new Date(villa.onboarding_expires_at) < new Date();
  if (expired) {
    return <StatusPage icon="⏰" title="Link expired" message="This link has expired. Your cleaner will add your details directly." />;
  }

  const community = (villa.community as any)?.name ?? "";

  return (
    <div className="min-h-screen bg-canvas px-4 py-8">
      <div className="mx-auto max-w-lg space-y-5">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 mb-2">
            <img src="/icons/icon.svg" alt="Carwaj" className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold">Welcome, {villa.owner_name}!</h1>
          <p className="text-sm text-gray-500">
            Please add your car details and preferred cleaning schedule.
          </p>
          {community && (
            <p className="text-xs text-gray-400">
              {community} · Villa {villa.villa_number}
            </p>
          )}
        </div>

        <OnboardingForm token={params.token} />
      </div>
    </div>
  );
}

function StatusPage({ icon, title, message }: { icon: string; title: string; message: string }) {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="text-center max-w-sm space-y-3">
        <div className="text-5xl">{icon}</div>
        <h1 className="text-xl font-bold">{title}</h1>
        <p className="text-sm text-gray-500">{message}</p>
      </div>
    </div>
  );
}
