import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAppwrite } from "../Provider/useAppwrite";
import { buildQueries } from "./queryBuilder";
import { resolveDbAndCollection } from "./helpers";
export function useCollection(arg1, arg2, arg3) {
    const { databases, client, cacheFusion, config } = useAppwrite();
    const { databaseId, collectionId, options } = resolveDbAndCollection(config.databaseId, arg1, arg2, arg3);
    const enabled = options.enabled !== false;
    const realtime = options.realtime !== false;
    const limit = options.limit || 25;
    const searchDebounceMs = options.searchDebounceMs || 300;
    // Stabilize complex option objects to prevent infinite render loops
    const serializedWhere = useMemo(() => (options.where ? JSON.stringify(options.where) : "{}"), [options.where]);
    const serializedQueries = useMemo(() => (options.queries ? options.queries.join("|") : ""), [options.queries]);
    const serializedSelect = useMemo(() => (options.select ? options.select.join(",") : ""), [options.select]);
    const serializedSort = useMemo(() => (options.sort ? JSON.stringify(options.sort) : ""), [options.sort]);
    // Search, filter, sort, page unified state
    const [search, setSearchState] = useState(options.search || "");
    const [debouncedSearch, setDebouncedSearch] = useState(options.search || "");
    const [filter, setFilterState] = useState(options.where || {});
    const [sortField, setSortField] = useState(options.sortField);
    const [sortOrder, setSortOrder] = useState(options.sortOrder);
    const [page, setPageState] = useState(options.page || 1);
    // Sync external options.where changes to internal state
    const prevSerializedWhereRef = useRef(serializedWhere);
    useEffect(() => {
        if (prevSerializedWhereRef.current !== serializedWhere) {
            prevSerializedWhereRef.current = serializedWhere;
            setFilterState(options.where || {});
        }
    }, [serializedWhere, options.where]);
    const [documents, setDocuments] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMountedRef = useRef(true);
    const onSuccessRef = useRef(options.onSuccess);
    const onErrorRef = useRef(options.onError);
    useEffect(() => {
        onSuccessRef.current = options.onSuccess;
        onErrorRef.current = options.onError;
    }, [options.onSuccess, options.onError]);
    // Debounce search string
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
        }, searchDebounceMs);
        return () => clearTimeout(timer);
    }, [search, searchDebounceMs]);
    // Auto-Reset page to 1 when search or filter changes
    const isFirstRenderRef = useRef(true);
    useEffect(() => {
        if (isFirstRenderRef.current) {
            isFirstRenderRef.current = false;
            return;
        }
        setPageState(1);
    }, [debouncedSearch, serializedWhere]);
    // Construct queries using buildQueries
    const queries = useMemo(() => {
        return buildQueries({
            queries: options.queries,
            where: filter,
            search: debouncedSearch,
            searchField: options.searchField,
            select: options.select,
            limit,
            page,
            sort: options.sort,
            sortField,
            sortOrder,
        });
    }, [
        serializedQueries,
        filter,
        debouncedSearch,
        options.searchField,
        serializedSelect,
        limit,
        page,
        serializedSort,
        sortField,
        sortOrder,
    ]);
    const queriesRef = useRef(queries);
    queriesRef.current = queries;
    const queryKey = useMemo(() => {
        return `coll:${databaseId}:${collectionId}:${JSON.stringify(queries)}`;
    }, [databaseId, collectionId, queries]);
    const fetchDocuments = useCallback(async () => {
        if (!enabled || !databaseId || !collectionId)
            return;
        setLoading(true);
        setError(null);
        try {
            const response = await databases.listDocuments(databaseId, collectionId, queriesRef.current);
            if (isMountedRef.current) {
                setDocuments(response.documents);
                setTotal(response.total);
                setLoading(false);
                // Warm Cache Fusion
                cacheFusion.setCollectionQuery(queryKey, {
                    documents: response.documents,
                    total: response.total,
                });
                onSuccessRef.current?.(response.documents, response.total);
            }
        }
        catch (err) {
            if (isMountedRef.current) {
                const errorObj = err instanceof Error ? err : new Error(String(err));
                setError(errorObj);
                setLoading(false);
                config.onError?.(err, `useCollection:${databaseId}/${collectionId}`);
                onErrorRef.current?.(errorObj);
            }
        }
    }, [databases, databaseId, collectionId, enabled, cacheFusion, queryKey, config]);
    // Execute fetch when queryKey changes
    useEffect(() => {
        isMountedRef.current = true;
        fetchDocuments();
        return () => {
            isMountedRef.current = false;
        };
    }, [fetchDocuments]);
    // Subscribe to CacheFusion updates for this query key
    useEffect(() => {
        const unsubscribeCache = cacheFusion.subscribeToKey(queryKey, () => {
            const cached = cacheFusion.getCollectionQuery(queryKey);
            if (cached && isMountedRef.current) {
                setDocuments(cached.documents);
                setTotal(cached.total);
            }
        });
        return unsubscribeCache;
    }, [cacheFusion, queryKey]);
    // Realtime subscription with zero-re-fetch Cache Fusion
    useEffect(() => {
        if (!enabled || !realtime || !databaseId || !collectionId)
            return;
        const channel = `databases.${databaseId}.collections.${collectionId}.documents`;
        const unsubscribeRealtime = client.subscribe(channel, (response) => {
            cacheFusion.handleRealtimeEvent({
                events: response.events,
                channels: response.channels,
                timestamp: response.timestamp,
                payload: response.payload,
            });
        });
        return () => {
            unsubscribeRealtime();
        };
    }, [client, enabled, realtime, databaseId, collectionId, cacheFusion]);
    // Action helpers
    const setSearch = useCallback((s) => {
        setSearchState(s);
    }, []);
    const setFilter = useCallback((newFilter) => {
        setFilterState(newFilter);
    }, []);
    const setSort = useCallback((field, order = "asc") => {
        setSortField(field);
        setSortOrder(order);
    }, []);
    const setPage = useCallback((p) => {
        setPageState(p);
    }, []);
    const totalPages = useMemo(() => {
        return Math.max(1, Math.ceil(total / limit));
    }, [total, limit]);
    const nextPage = useCallback(() => {
        setPageState((prev) => (prev < totalPages ? prev + 1 : prev));
    }, [totalPages]);
    const prevPage = useCallback(() => {
        setPageState((prev) => (prev > 1 ? prev - 1 : prev));
    }, []);
    // Return memoized object to prevent unnecessary re-renders of consuming components
    return useMemo(() => ({
        data: documents,
        documents,
        total,
        loading,
        error,
        page,
        totalPages,
        limit,
        search,
        setSearch,
        setFilter,
        setSort,
        setPage,
        nextPage,
        prevPage,
        refetch: fetchDocuments,
    }), [
        documents,
        total,
        loading,
        error,
        page,
        totalPages,
        limit,
        search,
        setSearch,
        setFilter,
        setSort,
        setPage,
        nextPage,
        prevPage,
        fetchDocuments,
    ]);
}
