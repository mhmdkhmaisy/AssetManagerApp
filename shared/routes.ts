import { z } from 'zod';
import { insertSettlementSchema, insertExpenseSchema, settlements, expenses } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  settlements: {
    list: {
      method: 'GET' as const,
      path: '/api/settlements' as const,
      responses: {
        200: z.array(z.custom<typeof settlements.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/settlements/:id' as const,
      responses: {
        200: z.custom<typeof settlements.$inferSelect & { expenses: typeof expenses.$inferSelect[] }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/settlements' as const,
      input: insertSettlementSchema.extend({
        expenses: z.array(insertExpenseSchema),
      }),
      responses: {
        201: z.custom<typeof settlements.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/settlements/:id' as const,
      input: insertSettlementSchema.extend({
        expenses: z.array(insertExpenseSchema),
      }),
      responses: {
        200: z.custom<typeof settlements.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/settlements/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    export: {
      method: 'GET' as const,
      path: '/api/settlements/:id/export' as const,
      responses: {
        200: z.any(), // File download (Excel)
        404: errorSchemas.notFound,
      },
    },
    exportPdf: {
      method: 'GET' as const,
      path: '/api/settlements/:id/export-pdf' as const,
      responses: {
        200: z.any(), // File download (PDF)
        404: errorSchemas.notFound,
      },
    }
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type CreateSettlementInput = z.infer<typeof api.settlements.create.input>;
export type SettlementResponse = z.infer<typeof api.settlements.create.responses[201]>;
