
import { createClient } from "@supabase/supabase-js";

declare const Deno: {
  serve: (handler: (req: Request) => Response | Promise<Response>) => void;
  env: { get: (key: string) => string | undefined };
};

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const authorization = req.headers.get("Authorization");

  if (!authorization?.startsWith("Bearer ")) {
    return Response.json({ error: "Not authenticated" }, {
      status: 401,
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: { Authorization: authorization },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data: { user }, error: userError } =
    await userClient.auth.getUser();

  if (userError || !user) {
    return Response.json({ error: "Invalid session" }, {
      status: 401,
    });
  }

  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  // Delete this user's stock records.
  const { error: stockError } = await admin
    .from("stock_items")
    .delete()
    .eq("user_id", user.id);

  if (stockError) {
    console.error("Stock deletion failed:", stockError.message);
    return Response.json({
      error: "Could not delete your stock records.",
    }, { status: 500 });
  }

  // Delete this user's profile.
  const { error: profileError } = await admin
    .from("profiles")
    .delete()
    .eq("id", user.id);

  if (profileError) {
    console.error("Profile deletion failed:", profileError.message);
    return Response.json({
      error: "Could not delete your profile.",
    }, { status: 500 });
  }

  // Permanently delete the Supabase Auth account.
  const { error: deleteError } = await admin.auth.admin.deleteUser(
    user.id
  );

  if (deleteError) {
    console.error("Auth deletion failed:", deleteError.message);
    return Response.json({
      error: "Your login account could not be deleted. Please contact support.",
    }, { status: 500 });
  }

  return Response.json({ success: true });
});
