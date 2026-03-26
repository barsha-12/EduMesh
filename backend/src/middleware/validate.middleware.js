/**
 * Middleware factory for Zod schema validation.
 * Validates req.body, req.query, or req.params against a Zod schema.
 * @param {import('zod').ZodSchema} schema - Zod schema to validate against
 * @param {'body' | 'query' | 'params'} source - Request property to validate
 * @returns {Function} Express middleware
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    try {
      const result = schema.safeParse(req[source]);

      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        }));

        return res.status(400).json({
          success: false,
          data: null,
          message: 'Validation failed',
          error: errors,
        });
      }

      // Replace with parsed (and potentially transformed) data
      req[source] = result.data;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        data: null,
        message: 'Validation error',
        error: error.message,
      });
    }
  };
}
