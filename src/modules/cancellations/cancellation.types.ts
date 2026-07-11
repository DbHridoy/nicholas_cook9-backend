export const cancellationStatuses = ["draft", "processed"] as const;

export type CancellationStatus = (typeof cancellationStatuses)[number];
