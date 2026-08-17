export async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      const isRateLimit = error?.status === 429 || error?.code === 429;
      const isUnavailable = error?.status === 503 || error?.code === 503;
      
      if (!isRateLimit && !isUnavailable && attempt === maxRetries) {
        throw error;
      }
      
      if (attempt >= maxRetries) {
        console.warn(`[Retry] Max retries (${maxRetries}) reached. Throwing error.`);
        throw error;
      }
      
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      console.warn(`[Retry] Operation failed (attempt ${attempt}/${maxRetries}). Retrying in ${delay}ms...`, error?.message || error);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error("Unreachable");
}
