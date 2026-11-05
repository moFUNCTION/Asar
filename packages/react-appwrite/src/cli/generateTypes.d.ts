export interface AttributeSchema {
    key: string;
    type: string;
    status: string;
    error: string;
    required: boolean;
    array: boolean;
    default?: any;
    elements?: string[];
    format?: string;
    size?: number;
    min?: number;
    max?: number;
    relatedCollection?: string;
    relationType?: string;
}
export interface CollectionSchema {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    databaseId: string;
    name: string;
    enabled: boolean;
    documentSecurity: boolean;
    attributes: AttributeSchema[];
    indexes: any[];
}
export declare function mapAttributeToTsType(attr: AttributeSchema): string;
export declare function toPascalCase(str: string): string;
export declare function generateTypeScriptForCollections(databaseId: string, collections: CollectionSchema[]): string;
//# sourceMappingURL=generateTypes.d.ts.map