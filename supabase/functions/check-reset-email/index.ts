 
// @ts-ignore -- Supabase Edge Functions resolves this Deno-compatible module URL.
import { createClient } from "@supabase/supabase-js";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Response | Promise<Response>): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const respond = (status: number, body: Record<string, unknown>) =>
    new Response(JSON.stringify(body), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  if (req.method !== "POST") {
    return respond(405, { error: "Method not allowed." });
  }

  try {
    const { email } = await req.json();

    if (
      typeof email !== "string" ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return respond(400, { error: "Please enter a valid email address." });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Required Supabase environment variables are missing.");
      return respond(500, { error: "Server configuration error." });
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const emailToFind = email.trim().toLowerCase();
    const perPage = 1000;
    let page = 1;
    let emailExists = false;

    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        console.error("Could not check user accounts:", error.message);
        return respond(500, { error: "Unable to check the email right now." });
      }

      emailExists = data.users.some(
        (user: { email?: string | null }) =>
          user.email?.toLowerCase() === emailToFind,
      );

      if (emailExists || data.users.length < perPage) break;
      page++;
    }

    if (!emailExists) {
      return respond(404, {
        error: "This email address does not exist. Please check your email and try again.",
      });
    }

    return respond(200, {
      exists: true,
      message: "Email found. You can now request a password reset link.",
    });
  } catch (error) {
    console.error("Unexpected reset-email check error:", error);
    return respond(500, { error: "Something went wrong. Please try again." });
  }
});
