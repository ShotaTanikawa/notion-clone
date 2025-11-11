import { atom, useAtom } from "jotai";
import { Note } from "./note.entity";

/**
 * ノートの一覧を Jotai で管理するためのカスタムフック。
 * Supabase から取得したノートをメモリ上で共有し、追加・削除・取得を担当します。
 */
const noteAtom = atom<Note[]>([]);

export const useNoteStore = () => {
    const [notes, setNotes] = useAtom(noteAtom);

    /**
     * Supabase から取得したノートを既存の配列にマージしつつ、重複を排除して保存します。
     */
    const set = (newNotes: Note[]) => {
        setNotes((oldNotes) => {
            const combineNotes = [...oldNotes, ...newNotes];

            const uniqueNotes: { [key: number]: Note } = {};

            for (const note of combineNotes) {
                uniqueNotes[note.id] = note;
            }
            return Object.values(uniqueNotes);
        });
    };

    /**
     * 指定したノートとその子孫ノートをすべて取り除きます。
     */
    const deleteNote = (id: number) => {
        const findChildrenIds = (parentId: number): number[] => {
            // 子ノートを再帰的に探索して ID を列挙
            const childrenIds = notes
                .filter((note) => note.parent_document == parentId)
                .map((child) => child.id);
            return childrenIds.concat(
                ...childrenIds.map((childId) => findChildrenIds(childId))
            );
        };

        const childrenIds = findChildrenIds(id);
        setNotes((oldNotes) =>
            oldNotes.filter((note) => ![...childrenIds, id].includes(note.id))
        );
    };

    /**
     * ID を指定して単一のノートを取得します。見つからない場合は undefined を返します。
     */
    const getOne = (id: number) => notes.find((note) => note.id === id);
    const clear = () => setNotes([]);

    return {
        getAll: () => notes,
        getOne,
        set,
        delete: deleteNote,
        clear,
    };
};
