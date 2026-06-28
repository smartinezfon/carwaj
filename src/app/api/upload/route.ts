import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const bookingId = formData.get("bookingId");

  if (!(file instanceof File) || typeof bookingId !== "string") {
    return NextResponse.json({ error: "file and bookingId are required" }, { status: 400 });
  }

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `bookings/${bookingId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("booking-photos")
    .upload(path, file, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  const { data } = supabase.storage.from("booking-photos").getPublicUrl(path);

  return NextResponse.json({ url: data.publicUrl });
}
