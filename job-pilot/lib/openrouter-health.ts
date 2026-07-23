export function getOpenRouterKeys(): string[] {
  return [
    process.env.OPENROUTER_API_KEY1,
    process.env.OPENROUTER_API_KEY2,
    process.env.OPENROUTER_API_KEY3,
  ].filter(Boolean) as string[];
}
