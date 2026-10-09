import fs from "fs";
import path from "path";

// Muat variabel .env.local
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
}

async function run() {
  const { checkSupabaseHealth, supabaseUrl } = await import("../src/lib/supabaseClient.ts");
  console.log("Supabase URL:", supabaseUrl);
  const status = await checkSupabaseHealth();
  console.log("Health Status:", JSON.stringify(status, null, 2));
}

run().catch(console.error);
