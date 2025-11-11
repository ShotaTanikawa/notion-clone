import { supabase } from "@/lib/supabase";

/**
 * noteRepository は Supabase 経由でノートデータを CRUD するための関数群をまとめたリポジトリです。
 * 各メソッドで SQL を直接書かずに呼び出せるようにしています。
 */
export const noteRepository = {
    async create(
        userId: string,
        params: { title?: string; parentId?: number }
    ) {
        // 新しいノートを作成し、作成されたレコードを返す
        const { data, error } = await supabase
            .from("notes")
            .insert([
                {
                    user_id: userId,
                    title: params.title,
                    parent_document: params.parentId,
                },
            ])
            .select()
            .single();
        if (error != null) throw new Error(error.message);
        return data;
    },

    async find(userId: string, parentDocumentId?: number) {
        // 親ノート ID の有無に応じてルートノートまたは子ノートを取得
        const query = supabase
            .from("notes")
            .select()
            .eq("user_id", userId)
            .order("created_at", { ascending: false });
        const { data } =
            parentDocumentId != null
                ? await query.eq("parent_document", parentDocumentId)
                : await query.is("parent_document", null);

        return data;
    },

    async findOne(userId: string, id: number) {
        // 単一ノートを ID 指定で取得
        const { data } = await supabase
            .from("notes")
            .select()
            .eq("id", id)
            .eq("user_id", userId)
            .single();
        return data;
    },

    async update(id: number, note: { title?: string; content?: string }) {
        // タイトルや本文を更新し、更新後のノートを返す
        const { data } = await supabase
            .from("notes")
            .update(note)
            .eq("id", id)
            .select()
            .single();
        return data;
    },

    async findByKeyword(userId: string, keyword: string) {
        // キーワードでタイトルまたは本文を部分一致検索
        const { data } = await supabase
            .from("notes")
            .select()
            .eq("user_id", userId)
            .or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`)
            .order("created_at", { ascending: false });
        return data;
    },

    async delete(id: number) {
        // 再帰的に子ノートを削除する Supabase のエッジ関数を呼び出す
        const { error } = await supabase.rpc(
            "delete_children_notes_recursively",
            { note_id: id }
        );
        if (error !== null) throw new Error(error.message);
        return true;
    },
};
