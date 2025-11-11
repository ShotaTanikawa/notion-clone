import { Database } from "database.types";

/**
 * Supabase の notes テーブルから生成したノートの型定義。
 */
export type Note = Database["public"]["Tables"]["notes"]["Row"];
