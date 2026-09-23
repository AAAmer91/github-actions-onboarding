export function hello(name?: string): string {
  const recipient = name?.trim() || "World";
  return `Hello, ${recipient}!`;
}
