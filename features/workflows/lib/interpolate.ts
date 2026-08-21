/**
 * Resolve `{{ nodeId.path.to.value }}` placeholders against a map of node
 * outputs. Supports dot-access and bracket-index notation in the path
 * (e.g. `items[0].name`).
 *
 * - If a path resolves to `undefined` / `null`, it is replaced with `""`.
 * - If it resolves to an object or array, it is replaced with its JSON representation.
 * - Primitive values are coerced to strings.
 */

// Matches {{ nodeId.some.path }} or {{ nodeId.items[0].name }}, trimming inner
// whitespace so both `{{x.y}}` and `{{ x.y }}` work.
const PLACEHOLDER_RE = /\{\{\s*(.+?)\s*\}\}/g;

// Splits a dotted path that may contain bracket indices into segments.
//   "items[0].name"  →  ["items", "0", "name"]
//   "a.b.c"          →  ["a", "b", "c"]
const SEGMENT_RE = /[^.[\]]+/g;

/**
 * Walk an object tree by path segments and return the value at the leaf.
 */
function getByPath(obj: unknown, segments: string[]): unknown {
  let current: unknown = obj;

  for (const seg of segments) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[seg];
  }

  return current;
}

/**
 * Resolve a single placeholder expression (everything between the `{{ }}`).
 *
 * The first segment is the node id; the rest form the path into that node's
 * output.  If only a node id is given (no dot path), the entire output for
 * that node is returned.
 */
function resolve(
  expr: string,
  outputs: Record<string, unknown>,
): string {
  const segments = expr.match(SEGMENT_RE);
  if (!segments || segments.length === 0) return "";

  const [nodeId, ...path] = segments;
  const nodeOutput = outputs[nodeId];

  if (nodeOutput === undefined || nodeOutput === null) return "";

  // No sub-path — the whole output is the value.
  const value = path.length === 0 ? nodeOutput : getByPath(nodeOutput, path);

  if (value === undefined || value === null) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Replace every `{{ … }}` placeholder in `text` with the corresponding value
 * from `outputs`.
 *
 * @param text    - The template string, e.g. `"Go to {{ open-url-1.url }}"`.
 * @param outputs - A map of node id → that node's output from the current run.
 * @returns The interpolated string with all placeholders resolved.
 *
 * @example
 * ```ts
 * const outputs = {
 *   "extract-1": { items: [{ name: "Foo" }], count: 3 },
 * };
 *
 * interpolate("Found {{ extract-1.count }} items", outputs);
 * // → "Found 3 items"
 *
 * interpolate("First: {{ extract-1.items[0].name }}", outputs);
 * // → "First: Foo"
 *
 * interpolate("Missing: {{ nope.x }}", outputs);
 * // → "Missing: "
 * ```
 */
export function interpolate(
  text: string,
  outputs: Record<string, unknown>,
): string {
  return text.replace(PLACEHOLDER_RE, (_, expr: string) =>
    resolve(expr, outputs),
  );
}
