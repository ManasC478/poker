import { createClient } from "@/lib/supabase/server";
import { QueryFn } from "@/lib/types";

export const hasTagQueryFn: QueryFn<string[], Set<number>> = async (tags) => {
  const supabase = await createClient();
  const { data } = await supabase.from('session_tags').select('session_id').in('tag', tags);
  if (!data) return new Set();
  return new Set(data.map(r => r.session_id));
};
