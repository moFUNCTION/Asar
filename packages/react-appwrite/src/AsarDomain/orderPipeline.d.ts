import type { OrderStatus } from "./models";
export interface OrderPipelineStageInfo {
    key: OrderStatus;
    stepNumber: number;
    titleEn: string;
    titleAr: string;
    descriptionEn: string;
    descriptionAr: string;
    requiresClientAction: boolean;
    badgeColor: string;
    statusType: "initial" | "warning" | "action" | "progress" | "complete";
}
export declare const ORDER_PIPELINE_STAGES: Record<OrderStatus, OrderPipelineStageInfo>;
export declare const ORDER_STAGE_SEQUENCE: OrderStatus[];
export declare const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]>;
export declare function isValidTransition(from: OrderStatus, to: OrderStatus): boolean;
export declare function getNextValidStates(current: OrderStatus): OrderStatus[];
export declare function getOrderStatusColor(status: OrderStatus): string;
export declare function getOrderStatusLabel(status: OrderStatus, lang?: "ar" | "en"): string;
export interface OrderStageProgressResult {
    currentStepIndex: number;
    totalSteps: number;
    progressPercent: number;
    stageInfo: OrderPipelineStageInfo;
    isCompleted: boolean;
    requiresClientAction: boolean;
}
export declare function getOrderStageProgress(status: OrderStatus): OrderStageProgressResult;
//# sourceMappingURL=orderPipeline.d.ts.map