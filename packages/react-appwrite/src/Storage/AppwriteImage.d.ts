import React from "react";
import type { ImageTransformOptions } from "../types";
export interface AppwriteImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, "src"> {
    bucketId: string;
    fileId: string;
    transformations?: ImageTransformOptions;
    fallbackSrc?: string;
    loadingPlaceholder?: React.ReactNode;
}
export declare const AppwriteImage: React.FC<AppwriteImageProps>;
//# sourceMappingURL=AppwriteImage.d.ts.map