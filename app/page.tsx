import { supabase } from "@/lib/supabase";

export default async function TestPage() {
  const { data } = await supabase.from("tenants").select("*").limit(1);

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
