import { requireSupabase } from "../lib/supabase";

export const getDefaultTableLabel = async () => {
  const { data, error } = await requireSupabase()
    .from("booking_settings")
    .select("default_table_label")
    .eq("id", "default")
    .single();

  if (error) throw error;
  if (!data || typeof data.default_table_label !== "string") {
    throw new Error("Supabase tidak mengembalikan nama meja default.");
  }
  return data.default_table_label;
};

export const updateDefaultTableLabel = async (label: string) => {
  const normalizedLabel = label.trim();
  if (normalizedLabel.length < 2 || normalizedLabel.length > 80) {
    throw new Error("Nama meja default harus terdiri dari 2–80 karakter.");
  }

  const { data, error } = await requireSupabase()
    .from("booking_settings")
    .update({
      default_table_label: normalizedLabel,
      updated_at: new Date().toISOString(),
    })
    .eq("id", "default")
    .select("default_table_label")
    .single();

  if (error) throw error;
  if (!data || typeof data.default_table_label !== "string") {
    throw new Error("Supabase tidak mengembalikan nama meja default yang disimpan.");
  }
  return data.default_table_label;
};
