export function getMessagePreview(body: string): string {
  return body
    .replace(/!\[[^\]]*]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)]\([^)]*\)/g, "$1")
    .replace(/[`*_>#~-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
