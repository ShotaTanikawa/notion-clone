import { User } from "@supabase/supabase-js";
import { atom, useAtom } from "jotai";

/**
 * 現在ログイン中のユーザー情報を保持する Jotai ストア。
 * 認証状態の共有に利用します。
 */
const currentUserAtom = atom<User>();

export const useCurrentUserStore = () => {
    const [currentUser, setCurrentUser] = useAtom(currentUserAtom);

    return { currentUser, set: setCurrentUser };
};
