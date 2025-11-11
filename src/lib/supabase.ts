import {
    createClient,
    RealtimeChannel,
    RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import { Database } from "../../database.types";
import { Note } from "@/modules/notes/note.entity";

/**
 * Supabase との通信に使う共通クライアント。
 * .env で設定した URL / API キーを読み込み、型安全に操作できるようにしています。
 */
export const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

/**
 * 指定ユーザーのノートテーブルに対するリアルタイム変更通知を購読します。
 */
export const subscribe = (
    userId: string,
    callback: (payload: RealtimePostgresChangesPayload<Note>) => void
) => {
    return supabase
        .channel("notes-changes")
        .on<Note>(
            "postgres_changes",
            {
                event: "*",
                schema: "public",
                table: "notes",
                filter: `user_id=eq.${userId}`,
            },
            callback
        )
        .subscribe();
};

/**
 * 購読していたチャンネルを解除します。
 */
export const unsubscribe = (channel: RealtimeChannel) => {
    supabase.removeChannel(channel);
};
