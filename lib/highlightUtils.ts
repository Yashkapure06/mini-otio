// Utility functions for text highlighting
export interface Highlight {
  id: string;
  text: string;
  messageId: string;
}

export function applyHighlightsToElement(
  element: HTMLElement,
  highlights: Highlight[],
  messageId: string
) {
  if (!element || highlights.length === 0) return;

  // Get highlights for this specific message
  const messageHighlights = highlights.filter((h) => h.messageId === messageId);
  if (messageHighlights.length === 0) return;

  // Get all text nodes in the element
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null);

  const textNodes: Text[] = [];
  let node;
  while ((node = walker.nextNode())) {
    textNodes.push(node as Text);
  }

  // Process each text node
  textNodes.forEach((textNode) => {
    const text = textNode.textContent || "";
    if (!text.trim()) return;

    // Sort highlights by text length (longest first) to avoid overlapping issues
    const sortedHighlights = [...messageHighlights].sort(
      (a, b) => b.text.length - a.text.length
    );

    let highlightedHTML = text;
    let hasHighlights = false;

    sortedHighlights.forEach((highlight, index) => {
      const escapedText = highlight.text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(`(${escapedText})`, "gi");

      if (regex.test(highlightedHTML)) {
        hasHighlights = true;

        highlightedHTML = highlightedHTML.replace(
          regex,
          `<mark class="bg-gray-100 text-blue-600  border border-gray-300 rounded-full px-2 py-1 text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors" data-highlight-id="${highlight.id}" title="Click to remove highlight">$1</mark>`
        );
      }
    });

    if (hasHighlights) {
      // create a temporary container to parse the HTML
      const temp = document.createElement("div");
      temp.innerHTML = highlightedHTML;

      // replace the text node with the highlighted content
      const parent = textNode.parentNode;
      if (parent) {
        while (temp.firstChild) {
          parent.insertBefore(temp.firstChild, textNode);
        }
        parent.removeChild(textNode);
      }
    }
  });
}

export function removeHighlightsFromElement(element: HTMLElement) {
  if (!element) return;

  // Find all highlight marks and replace them with their text content
  const marks = element.querySelectorAll("mark[data-highlight-id]");
  marks.forEach((mark) => {
    const textNode = document.createTextNode(mark.textContent || "");
    mark.parentNode?.replaceChild(textNode, mark);
  });
}

export function addHighlightClickListener(
  element: HTMLElement,
  onRemoveHighlight: (highlightId: string) => void
) {
  if (!element) return;

  element.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    const highlightId = target.getAttribute("data-highlight-id");

    if (highlightId && target.tagName === "MARK") {
      e.preventDefault();
      e.stopPropagation();
      onRemoveHighlight(highlightId);
    }
  });
}
