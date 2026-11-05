import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { useFileUrl } from "./useFileUrl";
export const AppwriteImage = ({ bucketId, fileId, transformations, fallbackSrc, loadingPlaceholder, alt = "Appwrite Image", className, style, onLoad, onError, ...rest }) => {
    const { getFilePreview } = useFileUrl();
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const imageUrl = useMemo(() => {
        if (!bucketId || !fileId)
            return fallbackSrc || "";
        try {
            return getFilePreview(bucketId, fileId, transformations);
        }
        catch {
            return fallbackSrc || "";
        }
    }, [bucketId, fileId, transformations, fallbackSrc, getFilePreview]);
    if (hasError && fallbackSrc) {
        return (_jsx("img", { src: fallbackSrc, alt: alt, className: className, style: style, ...rest }));
    }
    return (_jsxs(_Fragment, { children: [!isLoaded && loadingPlaceholder, _jsx("img", { src: imageUrl, alt: alt, className: className, style: {
                    ...style,
                    display: isLoaded || !loadingPlaceholder ? style?.display : "none",
                }, onLoad: (e) => {
                    setIsLoaded(true);
                    onLoad?.(e);
                }, onError: (e) => {
                    setHasError(true);
                    onError?.(e);
                }, ...rest })] }));
};
