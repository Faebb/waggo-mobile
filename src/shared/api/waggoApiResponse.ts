import { z } from 'zod';

/** Mirrors `WaggoApiMessage` (waggo-api › Waggo.Api/Common/Responses). */
export const waggoApiMessageSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
});

/** Mirrors `WaggoApiPagination`. `null` when the endpoint does not page. */
export const waggoApiPaginationSchema = z.object({
  page: z.number().int(),
  pageSize: z.number().int(),
  totalItems: z.number().int(),
  totalPages: z.number().int(),
  hasPrevious: z.boolean(),
  hasNext: z.boolean(),
});

export type WaggoApiMessage = z.infer<typeof waggoApiMessageSchema>;
export type WaggoApiPagination = z.infer<typeof waggoApiPaginationSchema>;

/** Raw envelope as it comes over the wire (`data` is null when `success` is false). */
export type WaggoApiEnvelope<T> = {
  success: boolean;
  data: T | null;
  pagination: WaggoApiPagination | null;
  errors: WaggoApiMessage[];
  warnings: WaggoApiMessage[];
  infos: WaggoApiMessage[];
  traceId: string | null;
};

/** Envelope of EVERY response of waggo-api. `data` is validated with the schema of each endpoint. */
export function waggoApiResponseSchema<T>(dataSchema: z.ZodType<T>): z.ZodType<WaggoApiEnvelope<T>> {
  return z.object({
    success: z.boolean(),
    data: dataSchema.nullable(),
    pagination: waggoApiPaginationSchema.nullable(),
    errors: z.array(waggoApiMessageSchema),
    warnings: z.array(waggoApiMessageSchema),
    infos: z.array(waggoApiMessageSchema),
    traceId: z.string().nullable(),
  }) as z.ZodType<WaggoApiEnvelope<T>>;
}

/** Successful envelope: `data` is guaranteed. */
export type WaggoApiResponse<T> = {
  data: T;
  pagination: WaggoApiPagination | null;
  warnings: WaggoApiMessage[];
  infos: WaggoApiMessage[];
  traceId: string | null;
};
