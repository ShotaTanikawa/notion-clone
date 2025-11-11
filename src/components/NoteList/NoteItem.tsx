import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
    ChevronRight,
    ChevronDown,
    FileIcon,
    MoreHorizontal,
    Plus,
    Trash,
} from "lucide-react";
import { Item } from "../SideBar/Item";
import { cn } from "@/lib/utils";
import { Note } from "@/modules/notes/note.entity";
import { useState } from "react";

interface Props {
    note: Note;
    expanded?: boolean;
    layer?: number;
    isSelected?: boolean;
    onExpand?: (event: React.MouseEvent) => void;
    onCreate?: (event: React.MouseEvent) => void;
    onDelete?: (event: React.MouseEvent) => void;
    onClick?: () => void;
}

/**
 * サイドバーの各ノート行を描画するプレゼンテーションコンポーネント。
 * ホバー状態で操作アイコンを表示し、親コンポーネントから受け取ったハンドラを呼び出します。
 */
export function NoteItem({
    note,
    onClick,
    layer = 0,
    expanded = false,
    isSelected = false,
    onCreate,
    onDelete,
    onExpand,
}: Props) {
    const [isHovered, setIsHovered] = useState(false);

    // 将来的に選択状態のスタイル変更に使うために、値だけ保持しておく
    void isSelected;

    /**
     * 展開状態やホバー状態に応じてアイコンを切り替えます。
     * 展開中は下矢印、ホバー中は右矢印、通常時はファイルアイコン。
     */
    const getIcon = () => {
        return expanded ? ChevronDown : isHovered ? ChevronRight : FileIcon;
    };

    /**
     * 右側のメニュー（削除ボタン／子ノート追加ボタン）を定義します。
     * ホバーしていないときは透明にして非表示扱いにします。
     */
    const menu = (
        <div
            className={cn(
                "ml-auto flex items-center gap-x-2",
                !isHovered && "opacity-0"
            )}
        >
            <DropdownMenu>
                <DropdownMenuTrigger onClick={(e) => e.stopPropagation()}>
                    <div
                        className="h-full ml-auto rounded-sm hover:bg-neutral-300"
                        role="button"
                    >
                        <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    className="w-60"
                    align="start"
                    side="right"
                    forceMount
                >
                    <DropdownMenuItem onClick={onDelete}>
                        <Trash className="w-4 h-4 mr-2" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <div
                className="h-full ml-auto rounded-sm hover:bg-neutral-300"
                role="button"
                onClick={onCreate}
            >
                <Plus className="w-4 h-4 text-muted-foreground" />
            </div>
        </div>
    );

    return (
        <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            role="button"
            style={{
                paddingLeft: layer != null ? `${layer * 12 + 12}px` : "12px",
            }}
        >
            <Item
                label={note.title ?? "無題"}
                icon={getIcon()}
                onIconClick={onExpand}
                trailingItem={menu}
                isActive={isHovered || isSelected}
            />
        </div>
    );
}
