import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all user data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;
  const [plans, chatHistory, bookings] = await Promise.all([
    sb.from("saved_plans").select("*").eq("user_id", user.id),
    sb.from("chat_history").select("*").eq("user_id", user.id),
    sb.from("bookings").select("*").eq("user_id", user.id),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    user_id: user.id,
    saved_plans: plans.data || [],
    chat_history: chatHistory.data || [],
    bookings: bookings.data || [],
  };

  if (format === "csv") {
    // Simple CSV for saved plans
    const rows = (exportData.saved_plans as any[]).map((p: any) =>
      [p.id, p.name, p.plan_type, p.created_at, p.updated_at].join(",")
    );
    const csv = ["id,name,plan_type,created_at,updated_at", ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=nub-data-export.csv",
      },
    });
  }

  return NextResponse.json(exportData, {
    headers: {
      "Content-Disposition": "attachment; filename=nub-data-export.json",
    },
  });
}
