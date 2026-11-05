import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { ExecutionMethod } from "appwrite";
import { useAppwrite } from "../Provider/useAppwrite";
export function useAppwriteFunction(functionId, defaultOptions = {}) {
    const { functions, config } = useAppwrite();
    const [execution, setExecution] = useState(null);
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const defaultOptionsRef = useRef(defaultOptions);
    useEffect(() => {
        defaultOptionsRef.current = defaultOptions;
    }, [defaultOptions]);
    const execute = useCallback(async (body, overrideOptions = {}) => {
        setIsLoading(true);
        setError(null);
        const opts = { ...defaultOptionsRef.current, ...overrideOptions };
        const bodyStr = typeof body === "object" ? JSON.stringify(body) : body || "";
        try {
            const result = await functions.createExecution(functionId, bodyStr, opts.async || false, opts.xpath || "/", opts.method || ExecutionMethod.POST, opts.headers);
            setExecution(result);
            let parsedData = result.responseBody;
            if (result.responseBody) {
                try {
                    parsedData = JSON.parse(result.responseBody);
                }
                catch {
                    parsedData = result.responseBody;
                }
            }
            setData(parsedData);
            setIsLoading(false);
            opts.onSuccess?.(result);
            return parsedData;
        }
        catch (err) {
            const errObj = err instanceof Error ? err : new Error(String(err));
            setError(errObj);
            setIsLoading(false);
            config.onError?.(err, `useAppwriteFunction:${functionId}`);
            opts.onError?.(errObj);
            throw errObj;
        }
    }, [functions, functionId, config]);
    return useMemo(() => ({
        execute,
        execution,
        data,
        isLoading,
        error,
        responseStatusCode: execution ? execution.responseStatusCode : null,
        duration: execution ? execution.duration : null,
    }), [execute, execution, data, isLoading, error]);
}
