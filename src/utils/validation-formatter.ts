import { ZodError } from 'zod';
import chalk from 'chalk';
// @ts-ignore - json-source-map doesn't have types
import { parse } from 'json-source-map';

/**
 * Formats a Zod validation error into a human-readable string with code snippets.
 * @param error The ZodError to format.
 * @param jsonString The original JSON string that failed validation.
 * @param fileName The name of the file being validated.
 */
export function formatValidationError(error: ZodError, jsonString: string, fileName: string): string {
  let sourceMap: any;
  try {
    sourceMap = parse(jsonString);
  } catch (err) {
    // If JSON is totally malformed, we can't use a source map
    sourceMap = null;
  }
  
  const lines = jsonString.split('\n');
  
  let output = chalk.red(`Validation error in ${fileName}:\n`);

  for (const issue of error.issues) {
    // Zod path is an array of strings/numbers. json-source-map uses JSON pointers.
    // We need to convert [ 'mcpServers', 'name', 'command' ] to '/mcpServers/name/command'
    const path = issue.path.length > 0 ? '/' + issue.path.join('/') : '';
    const pointer = sourceMap?.pointers?.[path];
    
    if (pointer) {
      // json-source-map returns 0-indexed line and column
      const lineNum = pointer.value.line;
      const colNum = pointer.value.column;
      
      output += `\n${chalk.yellow(`at ${path || 'root'}`)} (line ${lineNum + 1}, column ${colNum + 1}):\n`;
      
      // Snippet: 3 lines around the error
      const startLine = Math.max(0, lineNum - 1);
      const endLine = Math.min(lines.length - 1, lineNum + 1);
      
      for (let i = startLine; i <= endLine; i++) {
        const line = lines[i];
        const isErrorLine = i === lineNum;
        const linePrefix = (i + 1).toString().padStart(4) + ' | ';
        
        if (isErrorLine) {
          output += chalk.bgRed.white(linePrefix) + line + '\n';
          // Align caret with the column, taking prefix into account
          output += ' '.repeat(linePrefix.length + colNum) + chalk.red('^ ' + issue.message) + '\n';
        } else {
          output += chalk.gray(linePrefix) + line + '\n';
        }
      }
    } else {
      output += `\n${chalk.yellow(`at ${path || 'root'}`)}: ${chalk.red(issue.message)}\n`;
    }
  }

  return output;
}
