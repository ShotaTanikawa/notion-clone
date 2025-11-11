/**
 * BlockNote を使ったリッチテキストエディタコンポーネント。
 * 初期データの設定と変更通知を受け持ちます。
 */
import { ja } from "@blocknote/core/locales";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/mantine/style.css";
import { BlockNoteView } from "@blocknote/mantine";

interface EditorProps {
    onChange: (value: string) => void;
    initialContent?: string | null;
}

function Editor({ onChange, initialContent }: EditorProps) {
    const editor = useCreateBlockNote({
        dictionary: ja,
        initialContent:
            initialContent != null ? JSON.parse(initialContent) : undefined,
    });
    return (
        <div>
            <BlockNoteView
                editor={editor}
                theme={"light"}
                onChange={() => onChange(JSON.stringify(editor.document))}
            />
        </div>
    );
}

export default Editor;
