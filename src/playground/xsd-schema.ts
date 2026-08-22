// Reads thaimusicxml-1.0.xsd (generated from the RELAX NG schema by Trang -
// see .github/workflows/ci.yml) into a small lookup table:
// per element, its legal children, its attributes, and the doc comment
// Trang carried straight through from the RNG source. That is everything
// the playground's completion and hover providers need.
//
// This is not a general XSD reader - it only understands the narrow, regular
// shape Trang produces from a RELAX NG source (named top-level xs:element
// with either an inline xs:complexType or a type= to a built-in or a named
// complexType, xs:group indirection, and substitutionGroup for the two
// abstract heads structure-content and marker). Anything outside that shape
// is simply not collected, since it cannot occur in this file's own output.

export interface AttributeDef {
  name: string;
  required: boolean;
  values?: string[];
}

export type ElementKind = "empty" | "text" | "children";

export interface ElementDef {
  name: string;
  kind: ElementKind;
  children: string[];
  attributes: AttributeDef[];
  doc?: string;
}

export interface SchemaModel {
  rootElement: string;
  elements: Map<string, ElementDef>;
}

const XS_NS = "http://www.w3.org/2001/XMLSchema";

function childrenOf(el: Element, name: string): Element[] {
  return Array.from(el.children).filter(
    (c) => c.namespaceURI === XS_NS && c.localName === name,
  );
}

function firstChild(el: Element, name: string): Element | undefined {
  return childrenOf(el, name)[0];
}

function stripPrefix(ref: string): string {
  const i = ref.indexOf(":");
  return i === -1 ? ref : ref.slice(i + 1);
}

// The nearest preceding XML comment, skipping whitespace-only text nodes,
// stopping at the first sibling that isn't one of those two - so an element
// with nothing written above it (or only another element) gets no doc,
// rather than borrowing a comment that belongs to something else. Section
// banners ("==== Header ====") precede a few elements the same way a real
// doc comment would; those are filtered out by their own shape, not by name,
// since the same banner style is reused across unrelated sections.
function leadingComment(el: Element): string | undefined {
  let node: ChildNode | null = el.previousSibling;
  while (node) {
    if (node.nodeType === Node.COMMENT_NODE) {
      const text = node.textContent?.trim();
      if (!text) return undefined;
      const firstLine = text.split("\n")[0]?.trim() ?? "";
      return /^=+$/.test(firstLine) ? undefined : text;
    }
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      node = node.previousSibling;
      continue;
    }
    break;
  }
  return undefined;
}

function attributesOf(complexType: Element): AttributeDef[] {
  return childrenOf(complexType, "attribute").map((attr) => {
    const restriction = firstChild(
      firstChild(attr, "simpleType") ?? attr,
      "restriction",
    );
    const values = restriction
      ? childrenOf(restriction, "enumeration")
          .map((e) => e.getAttribute("value"))
          .filter((v): v is string => v !== null)
      : undefined;
    return {
      name: attr.getAttribute("name") ?? "",
      required: attr.getAttribute("use") === "required",
      values: values && values.length > 0 ? values : undefined,
    };
  });
}

export function buildSchemaModel(
  xsdSource: string,
  rootElement: string,
): SchemaModel {
  const doc = new DOMParser().parseFromString(xsdSource, "application/xml");
  const schema = doc.documentElement;

  const elementNodes = new Map<string, Element>();
  const groupNodes = new Map<string, Element>();
  const complexTypeNodes = new Map<string, Element>();
  const substitutionMembers = new Map<string, string[]>();

  for (const el of childrenOf(schema, "element")) {
    const name = el.getAttribute("name");
    if (!name) continue;
    elementNodes.set(name, el);
    const head = el.getAttribute("substitutionGroup");
    if (head) {
      const key = stripPrefix(head);
      const list = substitutionMembers.get(key) ?? [];
      list.push(name);
      substitutionMembers.set(key, list);
    }
  }
  for (const el of childrenOf(schema, "group")) {
    const name = el.getAttribute("name");
    if (name) groupNodes.set(name, el);
  }
  for (const el of childrenOf(schema, "complexType")) {
    const name = el.getAttribute("name");
    if (name) complexTypeNodes.set(name, el);
  }

  // Collects every <xs:element ref="..."/> reachable through nested
  // sequence/choice/all/group wrappers, expanding an abstract head to its
  // concrete substitutionGroup members rather than the head itself, which
  // can never actually appear in a document.
  function collectRefs(
    container: Element,
    out: Set<string>,
    seenGroups: Set<string>,
  ): void {
    for (const node of Array.from(container.children)) {
      if (node.namespaceURI !== XS_NS) continue;
      switch (node.localName) {
        case "element": {
          const ref = node.getAttribute("ref");
          if (!ref) break;
          const name = stripPrefix(ref);
          if (elementNodes.get(name)?.getAttribute("abstract") === "true") {
            for (const member of substitutionMembers.get(name) ?? [])
              out.add(member);
          } else {
            out.add(name);
          }
          break;
        }
        case "group": {
          const ref = node.getAttribute("ref");
          const name = ref && stripPrefix(ref);
          if (!name || seenGroups.has(name)) break;
          seenGroups.add(name);
          const group = groupNodes.get(name);
          if (group) collectRefs(group, out, seenGroups);
          break;
        }
        case "sequence":
        case "choice":
        case "all":
          collectRefs(node, out, seenGroups);
          break;
      }
    }
  }

  const elements = new Map<string, ElementDef>();
  for (const [name, el] of elementNodes) {
    if (el.getAttribute("abstract") === "true") continue;

    let complexType = firstChild(el, "complexType");
    if (!complexType) {
      const typeAttr = el.getAttribute("type");
      const typeName = typeAttr && stripPrefix(typeAttr);
      if (typeName && complexTypeNodes.has(typeName))
        complexType = complexTypeNodes.get(typeName);
    }

    const refs = new Set<string>();
    if (complexType) collectRefs(complexType, refs, new Set());

    const isTextish = !complexType || complexType.getAttribute("mixed") === "true";
    const kind: ElementKind =
      refs.size > 0 ? "children" : isTextish ? "text" : "empty";

    elements.set(name, {
      name,
      kind,
      children: Array.from(refs).sort(),
      attributes: complexType ? attributesOf(complexType) : [],
      doc: leadingComment(el),
    });
  }

  return { rootElement, elements };
}
