// Wires a SchemaModel (see xsd-schema.ts) into Monaco's completion and
// hover providers for the "xml" language: element names after "<",
// attribute names (enum-valued ones offered as a snippet choice) after a
// space inside a tag, and attribute values inside an open quote.
//
// This tracks XML structure with two regexes and a tag-name stack, not a
// real parser - good enough to know "which element is currently open" for
// completion purposes, not to validate the document. A comment or CDATA
// block that happens to contain something shaped like a tag can throw the
// stack off; conformance is check:corpus's job, not this one's.
import type * as Monaco from "monaco-editor/esm/vs/editor/editor.api.js";
import type { SchemaModel } from "./xsd-schema";

type XmlContext =
  | { kind: "element"; parent: string | undefined; replaceFrom: number }
  | {
      kind: "attribute-name";
      element: string;
      existing: Set<string>;
      replaceFrom: number;
    }
  | {
      kind: "attribute-value";
      element: string;
      attribute: string;
      replaceFrom: number;
    };

// The start of the last "<" before `text`'s end with no closing ">" yet -
// i.e. the point is inside an open tag - or -1 if the point sits in plain
// text content between tags.
function findUnclosedTagStart(text: string): number {
  const lt = text.lastIndexOf("<");
  if (lt === -1) return -1;
  return text.indexOf(">", lt) === -1 ? lt : -1;
}

function computeAncestorStack(text: string): string[] {
  const tagRe = /<(\/?)([\w.-]+)[^<>]*?(\/?)>/g;
  const stack: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(text))) {
    const [, closing, name, selfClose] = m;
    if (closing) {
      const i = stack.lastIndexOf(name);
      if (i !== -1) stack.length = i;
    } else if (!selfClose) {
      stack.push(name);
    }
  }
  return stack;
}

function analyzeXmlContext(textBeforeCursor: string): XmlContext | undefined {
  const lt = findUnclosedTagStart(textBeforeCursor);
  if (lt === -1) return undefined;
  const tail = textBeforeCursor.slice(lt);
  if (tail[1] === "/") return undefined; // closing tag - nothing to offer

  const nameMatch = /^<([\w.-]*)$/.exec(tail);
  if (nameMatch) {
    const stack = computeAncestorStack(textBeforeCursor.slice(0, lt));
    return { kind: "element", parent: stack.at(-1), replaceFrom: lt + 1 };
  }

  const tagNameMatch = /^<([\w.-]+)/.exec(tail);
  if (!tagNameMatch) return undefined;

  const valueMatch = /([\w.-]+)\s*=\s*(["'])([^"']*)$/.exec(tail);
  if (valueMatch) {
    return {
      kind: "attribute-value",
      element: tagNameMatch[1],
      attribute: valueMatch[1],
      replaceFrom:
        lt + valueMatch.index! + valueMatch[0].length - valueMatch[3].length,
    };
  }

  const partial = /[\w-]*$/.exec(tail)?.[0] ?? "";
  const existing = new Set(
    Array.from(tail.matchAll(/([\w.-]+)\s*=/g)).map((m) => m[1]),
  );
  return {
    kind: "attribute-name",
    element: tagNameMatch[1],
    existing,
    replaceFrom: textBeforeCursor.length - partial.length,
  };
}

export function registerXmlCompletion(
  monaco: typeof Monaco,
  schema: SchemaModel,
): Monaco.IDisposable {
  return monaco.languages.registerCompletionItemProvider("xml", {
    triggerCharacters: ["<", " ", '"', "'"],
    provideCompletionItems(model, position) {
      const offset = model.getOffsetAt(position);
      const ctx = analyzeXmlContext(model.getValue().slice(0, offset));
      if (!ctx) return { suggestions: [] };

      const from = model.getPositionAt(ctx.replaceFrom);
      const range = new monaco.Range(
        from.lineNumber,
        from.column,
        position.lineNumber,
        position.column,
      );

      if (ctx.kind === "element") {
        // The "<" that triggered this completion auto-closed into "<>"
        // (see xml.js's autoClosingPairs), leaving a "|>" at the cursor.
        // Our own snippet supplies its own ">", so widen the range to
        // consume that already-there one instead of leaving it dangling.
        const nextChar = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: position.column,
          endLineNumber: position.lineNumber,
          endColumn: position.column + 1,
        });
        const elementRange =
          nextChar === ">"
            ? new monaco.Range(
                range.startLineNumber,
                range.startColumn,
                position.lineNumber,
                position.column + 1,
              )
            : range;

        const names = ctx.parent
          ? (schema.elements.get(ctx.parent)?.children ?? [])
          : [schema.rootElement];
        return {
          suggestions: names.map((name) => {
            const def = schema.elements.get(name);
            const snippet =
              def?.kind === "empty" ? `${name}/>$0` : `${name}>$0</${name}>`;
            return {
              label: name,
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: snippet,
              insertTextRules:
                monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
              documentation: def?.doc,
              range: elementRange,
            };
          }),
        };
      }

      if (ctx.kind === "attribute-name") {
        const attrs = (
          schema.elements.get(ctx.element)?.attributes ?? []
        ).filter((a) => !ctx.existing.has(a.name));
        return {
          suggestions: attrs.map((a) => ({
            label: a.name,
            kind: monaco.languages.CompletionItemKind.Field,
            detail: a.required ? "required" : undefined,
            insertText: a.values?.length
              ? `${a.name}="\${1|${a.values.join(",")}|}"$0`
              : `${a.name}="$0"`,
            insertTextRules:
              monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            range,
          })),
        };
      }

      const attr = schema.elements
        .get(ctx.element)
        ?.attributes.find((a) => a.name === ctx.attribute);
      return {
        suggestions: (attr?.values ?? []).map((value) => ({
          label: value,
          kind: monaco.languages.CompletionItemKind.Value,
          insertText: value,
          range,
        })),
      };
    },
  });
}

export function registerXmlHover(
  monaco: typeof Monaco,
  schema: SchemaModel,
): Monaco.IDisposable {
  return monaco.languages.registerHoverProvider("xml", {
    provideHover(model, position) {
      const word = model.getWordAtPosition(position);
      if (!word) return null;
      // Only for a tag name - the two characters right before it must be
      // "<" or "</" - not arbitrary word-shaped text content.
      const before = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: Math.max(1, word.startColumn - 2),
        endLineNumber: position.lineNumber,
        endColumn: word.startColumn,
      });
      if (!/<\/?$/.test(before)) return null;
      const doc = schema.elements.get(word.word)?.doc;
      if (!doc) return null;
      return {
        range: new monaco.Range(
          position.lineNumber,
          word.startColumn,
          position.lineNumber,
          word.endColumn,
        ),
        contents: [{ value: doc }],
      };
    },
  });
}
