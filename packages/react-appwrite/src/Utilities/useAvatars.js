import { useCallback, useMemo } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
export function useAvatars() {
    const { avatars } = useAppwrite();
    const getInitials = useCallback((name, width = 100, height = 100, background) => {
        return avatars.getInitials(name, width, height, background);
    }, [avatars]);
    const getQR = useCallback((text, size = 400, margin = 1, download = false) => {
        return avatars.getQR(text, size, margin, download);
    }, [avatars]);
    const getCreditCard = useCallback((code, width = 100, height = 100, quality = 100) => {
        return avatars.getCreditCard(code, width, height, quality);
    }, [avatars]);
    const getFavicon = useCallback((url) => {
        return avatars.getFavicon(url);
    }, [avatars]);
    const getFlag = useCallback((code, width = 100, height = 100, quality = 100) => {
        return avatars.getFlag(code, width, height, quality);
    }, [avatars]);
    const getBrowser = useCallback((code, width = 100, height = 100, quality = 100) => {
        return avatars.getBrowser(code, width, height, quality);
    }, [avatars]);
    const getImage = useCallback((url, width = 400, height = 400) => {
        return avatars.getImage(url, width, height);
    }, [avatars]);
    return useMemo(() => ({
        getInitials,
        getQR,
        getCreditCard,
        getFavicon,
        getFlag,
        getBrowser,
        getImage,
    }), [
        getInitials,
        getQR,
        getCreditCard,
        getFavicon,
        getFlag,
        getBrowser,
        getImage,
    ]);
}
