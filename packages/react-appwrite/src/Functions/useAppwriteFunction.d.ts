import { type Models } from "appwrite";
import type { UseFunctionOptions } from "../types";
export interface UseAppwriteFunctionReturn<TData = any> {
    execute: (body?: string | Record<string, any>, overrideOptions?: UseFunctionOptions) => Promise<TData>;
    execution: Models.Execution | null;
    data: TData | null;
    isLoading: boolean;
    error: Error | null;
    responseStatusCode: number | null;
    duration: number | null;
}
export declare function useAppwriteFunction<TData = any>(functionId: string, defaultOptions?: UseFunctionOptions): UseAppwriteFunctionReturn<TData>;
//# sourceMappingURL=useAppwriteFunction.d.ts.map