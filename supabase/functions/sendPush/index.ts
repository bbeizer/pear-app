import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const { userId, title, body } = await req.json();

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const { data: profile, error } = await supabaseClient
    .from("profiles")
    .select("push_token")
    .eq("id", userId)
    .single();

  if (error || !profile?.push_token) {
    return new Response(JSON.stringify({ error: "No push token found" }), {
      status: 400,
    });
  }

  const pushRes = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: profile.push_token,
      sound: "default",
      title,
      body,
    }),
  });

  const result = await pushRes.json();

  return new Response(JSON.stringify({ result }), { status: 200 });
});
