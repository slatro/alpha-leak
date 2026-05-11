export function env(name, fallback = "") {
  return process.env[name] || fallback;
}

export function requireEnv(name) {
  const value = env(name);
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export function hasSupabaseAdapter() {
  return Boolean(env("SUPABASE_URL") && env("SUPABASE_SERVICE_ROLE_KEY"));
}
