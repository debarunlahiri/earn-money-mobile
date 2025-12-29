/**
 * API Logger Utility
 * Provides formatted curl command logging and response logging for debugging
 */

const IS_LOGGING_ENABLED = __DEV__; // Only log in development mode

interface LogColors {
  reset: string;
  cyan: string;
  green: string;
  yellow: string;
  red: string;
  magenta: string;
  blue: string;
}

// ANSI color codes for terminal (works in React Native debugger)
const colors: LogColors = {
  reset: '\x1b[0m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

/**
 * Converts FormData to a curl command string
 */
const formDataToCurl = (url: string, formData: FormData): string => {
  const formEntries: string[] = [];

  // FormData iteration - extract entries
  // Note: FormData.entries() may not be available in all RN environments
  // We'll build from the _parts if available (React Native FormData internals)
  const parts = (formData as any)._parts;
  if (parts && Array.isArray(parts)) {
    parts.forEach(([key, value]: [string, any]) => {
      formEntries.push(`--form '${key}="${value}"'`);
    });
  }

  return `curl --location '${url}' \\
${formEntries.join(' \\\n')}`;
};

/**
 * Logs the API request as a curl command
 */
export const logRequest = (
  url: string,
  method: string,
  formData?: FormData,
  headers?: Record<string, string>,
): void => {
  if (!IS_LOGGING_ENABLED) return;

  console.log('\n' + '='.repeat(60));
  console.log(`${colors.cyan}[REQUEST]${colors.reset}`);
  console.log('-'.repeat(60));

  if (formData) {
    const curlCommand = formDataToCurl(url, formData);
    console.log(`${colors.yellow}${curlCommand}${colors.reset}`);
  } else {
    console.log(
      `${colors.yellow}curl --location '${url}' --request ${method}${colors.reset}`,
    );
  }

  if (headers && Object.keys(headers).length > 0) {
    console.log(`\n${colors.magenta}Headers:${colors.reset}`);
    Object.entries(headers).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
  }

  console.log('-'.repeat(60));
};

/**
 * Logs the API response
 */
export const logResponse = (
  url: string,
  status: number,
  data: any,
  duration?: number,
): void => {
  if (!IS_LOGGING_ENABLED) return;

  const isSuccess = status >= 200 && status < 300;
  const statusColor = isSuccess ? colors.green : colors.red;
  const statusIcon = isSuccess ? '[OK]' : '[FAIL]';

  console.log(`${statusColor}[RESPONSE] ${statusIcon}${colors.reset}`);
  console.log('-'.repeat(60));
  console.log(`${colors.blue}URL:${colors.reset} ${url}`);
  console.log(
    `${colors.blue}Status:${colors.reset} ${statusColor}${status}${colors.reset}`,
  );

  if (duration !== undefined) {
    console.log(`${colors.blue}Duration:${colors.reset} ${duration}ms`);
  }

  console.log(`${colors.blue}Response:${colors.reset}`);
  console.log(colors.green + JSON.stringify(data, null, 2) + colors.reset);
  console.log('='.repeat(60) + '\n');
};

/**
 * Logs an API error
 */
export const logError = (url: string, error: any, duration?: number): void => {
  if (!IS_LOGGING_ENABLED) return;

  console.log(`${colors.red}[ERROR]${colors.reset}`);
  console.log('-'.repeat(60));
  console.log(`${colors.blue}URL:${colors.reset} ${url}`);

  if (duration !== undefined) {
    console.log(`${colors.blue}Duration:${colors.reset} ${duration}ms`);
  }

  console.log(`${colors.red}Error:${colors.reset}`);
  console.log(colors.red + (error?.message || String(error)) + colors.reset);

  if (error?.stack) {
    console.log(`${colors.red}Stack:${colors.reset}`);
    console.log(error.stack);
  }

  console.log('='.repeat(60) + '\n');
};

/**
 * Creates a wrapped fetch function with logging
 */
export const fetchWithLogging = async (
  url: string,
  options: RequestInit & {formData?: FormData} = {},
): Promise<Response> => {
  const startTime = Date.now();
  const method = options.method || 'GET';

  // Log request
  logRequest(
    url,
    method,
    options.formData,
    options.headers as Record<string, string>,
  );

  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    // Clone response to read body without consuming it
    const clonedResponse = response.clone();
    const data = await clonedResponse
      .json()
      .catch(() => 'Unable to parse response');

    logResponse(url, response.status, data, duration);

    return response;
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(url, error, duration);
    throw error;
  }
};
