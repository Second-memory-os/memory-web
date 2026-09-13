/**
 * Check if Local Core is running and healthy
 */
export async function checkLocalCoreHealth(baseUrl = 'http://127.0.0.1:3002'): Promise<{
  isRunning: boolean;
  engine?: string;
  mode?: string;
  path?: string;
  error?: string;
}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${baseUrl}/health`, {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { isRunning: false, error: `HTTP ${response.status}` };
    }

    const data = await response.json();

    return {
      isRunning: true,
      engine: data.storage?.engine,
      mode: data.storage?.mode,
      path: data.storage?.pathHint || data.storage?.path,
    };
  } catch (error) {
    return {
      isRunning: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}
