import type { UseCollectionOptions, WhereFilter } from "../types";
/**
 * Recursively parses declarative WhereFilter into Appwrite query strings,
 * including nested logical $or and $and operators.
 */
export declare function parseWhereClause<T = Record<string, any>>(where: WhereFilter<T>): string[];
/**
 * Builds an array of Appwrite Query strings from declarative UseCollectionOptions.
 */
export declare function buildQueries<T = Record<string, any>>(options: UseCollectionOptions<T>): string[];
//# sourceMappingURL=queryBuilder.d.ts.map