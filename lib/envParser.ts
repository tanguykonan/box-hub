export interface ParsedEnvVar {
  name: string;
  required: boolean;
  default?: string;
  description: string;
}

/**
 * Parses raw .env / .env.example content into structured variable list
 */
export function parseEnvContent(rawContent: string): ParsedEnvVar[] {
  const lines = rawContent.split("\n");
  const result: ParsedEnvVar[] = [];
  let currentComment = "";

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      currentComment = "";
      continue;
    }

    // Comment line
    if (trimmed.startsWith("#")) {
      const commentText = trimmed.replace(/^#+\s*/, "").trim();
      currentComment = currentComment ? `${currentComment} • ${commentText}` : commentText;
      continue;
    }

    // Key=Value line
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx !== -1) {
      const key = trimmed.substring(0, eqIdx).trim();
      let rest = trimmed.substring(eqIdx + 1).trim();

      // Check for inline comment (e.g. PORT=8080 # comment)
      let inlineComment = "";
      const inlineCommentIdx = rest.indexOf("#");
      if (inlineCommentIdx !== -1) {
        inlineComment = rest.substring(inlineCommentIdx + 1).trim();
        rest = rest.substring(0, inlineCommentIdx).trim();
      }

      // Strip surrounding quotes
      const val = rest.replace(/^["']|["']$/g, "").trim();

      const isRequired =
        !val ||
        val.toLowerCase().includes("your_") ||
        val.toLowerCase().includes("secret") ||
        val.toLowerCase().includes("required") ||
        val.toLowerCase().includes("token") ||
        val.toLowerCase().includes("key");

      const description =
        inlineComment || currentComment || (isRequired ? "Variable requise pour l'exécution" : "Optionnel");

      result.push({
        name: key,
        required: isRequired,
        default: val || undefined,
        description,
      });

      currentComment = "";
    }
  }

  return result;
}

/**
 * Converts structured variables array back into .env.example string
 */
export function stringifyEnvVars(vars: ParsedEnvVar[]): string {
  return vars
    .map((v) => {
      const comment = v.description ? `# ${v.description}\n` : "";
      const val = v.default || (v.required ? "your_token_here" : "");
      return `${comment}${v.name}=${val}`;
    })
    .join("\n\n");
}
