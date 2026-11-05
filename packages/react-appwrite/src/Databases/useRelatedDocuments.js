import { useMemo } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
import { useCollection } from "./useCollection";
export function useRelatedDocuments(arg1, arg2, arg3, arg4, arg5) {
    const { config } = useAppwrite();
    let databaseId;
    let targetCollectionId;
    let parentDocumentId;
    let relationshipAttribute;
    let options;
    if (typeof arg4 === "string") {
        databaseId = arg1;
        targetCollectionId = arg2;
        parentDocumentId = arg3;
        relationshipAttribute = arg4;
        options = arg5 || {};
    }
    else {
        if (!config.databaseId) {
            throw new Error(`[react-appwrite] Database ID was not provided and no default 'databaseId' was configured in <AppwriteProvider>.`);
        }
        databaseId = config.databaseId;
        targetCollectionId = arg1;
        parentDocumentId = arg2;
        relationshipAttribute = arg3;
        options = (arg4 || {});
    }
    const whereFilter = useMemo(() => {
        return {
            [relationshipAttribute]: parentDocumentId,
        };
    }, [relationshipAttribute, parentDocumentId]);
    return useCollection(databaseId, targetCollectionId, {
        ...options,
        where: whereFilter,
        enabled: options.enabled !== false && !!parentDocumentId,
    });
}
