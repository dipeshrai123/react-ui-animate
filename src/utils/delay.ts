/**
 * @param { number } ms - number of milliseconds to delay code execution
 * @returns Promise
 */
export function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(null), ms);
  });
}
