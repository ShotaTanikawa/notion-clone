/**
 * 全ページ共通のレイアウト。ノートの初期読み込みや検索モーダルの制御など、
 * 画面全体に関わるロジックをまとめています。
 */
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import SideBar from "./components/SideBar";
import { SearchModal } from "./components/SearchModal";
import { useCurrentUserStore } from "./modules/auth/current-user.state";
import { useNoteStore } from "./modules/notes/note.state";
import { useEffect, useState } from "react";
import { noteRepository } from "./modules/notes/note.repository";
import { Note } from "./modules/notes/note.entity";
import { subscribe, unsubscribe } from "./lib/supabase";

const Layout = () => {
    const navigate = useNavigate();
    const { currentUser } = useCurrentUserStore();
    const noteStore = useNoteStore();
    const [isLoading, setIsLoading] = useState(false);
    const [isShowModal, setIsShowModal] = useState(false);
    const [serchResult, setSerchResult] = useState<Note[]>([]);

    useEffect(() => {
        fetchNotes();
        const channel = subscribeNote();
        return () => {
            unsubscribe(channel!);
        };
    }, []);

    const subscribeNote = () => {
        if (currentUser == null) return;
        return subscribe(currentUser!.id, (payload) => {
            if (
                payload.eventType === "INSERT" ||
                payload.eventType === "UPDATE"
            ) {
                noteStore.set([payload.new]);
            } else if (payload.eventType === "DELETE") {
                noteStore.delete(payload.old.id!);
            }
        });
    };

    const fetchNotes = async () => {
        setIsLoading(true);
        const notes = await noteRepository.find(currentUser!.id);
        if (notes == null) return;
        noteStore.set(notes);
        setIsLoading(false);
    };

    const serchNotes = async (keyword: string) => {
        const notes = await noteRepository.findByKeyword(
            currentUser!.id,
            keyword
        );
        if (notes == null) return;
        noteStore.set(notes);
        setSerchResult(notes);
    };

    if (currentUser == null) {
        return <Navigate replace to="/signin" />;
    }

    const moveToDetatil = (noteId: number) => {
        navigate(`/note/${noteId}`);
        setIsShowModal(false);
    };

    return (
        <div className="h-full flex">
            {!isLoading && (
                <SideBar
                    onSearchButtonClicked={() => {
                        setIsShowModal(true);
                    }}
                />
            )}
            <main className="flex-1 h-full overflow-y-auto">
                <Outlet />
                <SearchModal
                    isOpen={isShowModal}
                    notes={serchResult}
                    onItemSelect={moveToDetatil}
                    onKeywordChanged={serchNotes}
                    onClose={() => {
                        setIsShowModal(false);
                    }}
                />
            </main>
        </div>
    );
};

export default Layout;
