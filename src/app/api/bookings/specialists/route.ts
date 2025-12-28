import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: NextRequest) {
  const serviceId = req.nextUrl.searchParams.get("service_id");

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data } = await supabase
    .from("specialist_services")
    .select("specialists(id, name, bio_ar, avatar_url)")
    .eq("service_id", serviceId);

  const specialists = data?.map((d: any) => d.specialists) || [];

  return NextResponse.json({ specialists });
}
