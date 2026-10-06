export type ProductAttributes = Record<string, string | number | boolean | null | undefined>;

export function attributesEqual(
  left: ProductAttributes | undefined,
  right: ProductAttributes | undefined,
): boolean {
  return stableSerialize(left ?? {}) === stableSerialize(right ?? {});
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(",")}]`;
  }

  if (value && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => `${JSON.stringify(key)}:${stableSerialize(entry)}`);
    return `{${entries.join(",")}}`;
  }

  return JSON.stringify(value);
}
