import { cn } from "@/lib/utils";
import { NoteItem } from "./NoteItem";
import { useNoteStore } from "@/modules/notes/note.state";
import { useCurrentUserStore } from "@/modules/auth/current-user.state";
import React, { useState } from "react";
import { noteRepository } from "@/modules/notes/note.repository";
import { Note } from "@/modules/notes/note.entity";
import { useNavigate, useParams } from "react-router-dom";

interface NoteListProps {
    layer?: number;
    parentId?: number;
}

/**
 * ノートのツリー表示を担うコンポーネント。
 * 親子関係に沿って再帰的に自分自身を呼び出し、クリック時の読み込みや削除などを扱います。
 */
export function NoteList({ layer = 0, parentId }: NoteListProps) {
    const params = useParams();
    const id = params.id != null ? parseInt(params.id) : undefined;
    const navigate = useNavigate();
    const noteStore = useNoteStore();
    const notes = noteStore.getAll();
    const { currentUser } = useCurrentUserStore();
    const [expanded, setExpanded] = useState<Map<number, boolean>>(new Map());

    /**
     * 指定したノートの直下に子ノートを追加し、作成後は詳細画面に遷移します。
     */
    const createChild = async (e: React.MouseEvent, parentId: number) => {
        e.stopPropagation();
        const newNote = await noteRepository.create(currentUser!.id, {
            parentId,
        });
        noteStore.set([newNote]);
        setExpanded((prev) => prev.set(parentId, true));
        moveToDetail(newNote.id);
    };

    /**
     * アイコンをクリックしたノートの子ノートを Supabase から取得し、
     * 取得できたら展開状態をトグルします。
     */
    const fetchChildren = async (e: React.MouseEvent, note: Note) => {
        e.stopPropagation();
        const children = await noteRepository.find(currentUser!.id, note.id);
        if (children == null) return;
        noteStore.set(children);
        setExpanded((prev) => {
            const newExpanded = new Map(prev);
            newExpanded.set(note.id, !prev.get(note.id));
            return newExpanded;
        });
    };

    /**
     * ノート本体（および子孫ノート）を削除し、トップページへ戻します。
     */
    const deleteNote = async (e: React.MouseEvent, noteId: number) => {
        e.stopPropagation();
        await noteRepository.delete(noteId);
        noteStore.delete(noteId);
        navigate("/");
    };

    /**
     * サイドバーの項目クリック時にノート詳細ページへ遷移します。
     */
    const moveToDetail = (noteId: number) => {
        navigate(`/note/${noteId}`);
    };

    return (
        <>
            <p
                className={cn(
                    `hidden text-sm font-medium text-muted-foreground/80`,
                    layer === 0 && "hidden"
                )}
                style={{
                    paddingLeft: layer ? `${layer * 12 + 25}px` : undefined,
                }}
            >
                ページがありません
            </p>
            {notes
                .filter((note) => note.parent_document == parentId)
                .map((note) => {
                    return (
                        <div key={note.id}>
                            <NoteItem
                                note={note}
                                layer={layer}
                                isSelected={id == note.id}
                                expanded={expanded.get(note.id)}
                                onExpand={(e: React.MouseEvent) =>
                                    fetchChildren(e, note)
                                }
                                onCreate={(e) => createChild(e, note.id)}
                                onClick={() => moveToDetail(note.id)}
                                onDelete={(e) => deleteNote(e, note.id)}
                            />
                            {expanded.get(note.id) && (
                                <NoteList
                                    layer={layer + 1}
                                    parentId={note.id}
                                />
                            )}
                        </div>
                    );
                })}
        </>
    );
}
