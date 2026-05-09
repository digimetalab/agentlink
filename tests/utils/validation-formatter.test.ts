import { describe, it, expect } from 'vitest';
import { z, ZodError } from 'zod';
import { formatValidationError } from '../../src/utils/validation-formatter';
import chalk from 'chalk';

describe('formatValidationError', () => {
  const schema = z.object({
    name: z.string().min(1, "Name cannot be empty"),
    age: z.number().min(18, "Must be at least 18")
  });

  const jsonString = `{
  "name": "",
  "age": 10
}`;

  it('should format Zod errors with code snippets', () => {
    const result = schema.safeParse(JSON.parse(jsonString));
    if (result.success) throw new Error("Validation should have failed");

    const formatted = formatValidationError(result.error, jsonString, 'user.json');

    // Basic checks
    expect(formatted).toContain('Validation error in user.json:');
    expect(formatted).toContain('at /name');
    expect(formatted).toContain('at /age');
    expect(formatted).toContain('Name cannot be empty');
    expect(formatted).toContain('Must be at least 18');
    
    // Check for snippet indicators (line numbers and separators)
    expect(formatted).toContain('2 | ');
    expect(formatted).toContain('3 | ');
    expect(formatted).toContain('^');
  });

  it('should handle root-level errors', () => {
    const rootSchema = z.string();
    const rootJson = '123';
    
    try {
      rootSchema.parse(123);
    } catch (e) {
      if (e instanceof ZodError) {
        const formatted = formatValidationError(e, rootJson, 'test.json');
        expect(formatted).toContain('at root');
        expect(formatted).toContain('expected string, received number');
      }
    }
  });
});
