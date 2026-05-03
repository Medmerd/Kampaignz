export const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

export const mount = (root: HTMLElement, html: string) => {
  root.innerHTML = html;
};

export const queryRequired = <T extends Element>(
  selector: string,
  parent: ParentNode = document,
): T => {
  const element = parent.querySelector<T>(selector);

  if (!element) {
    throw new Error(`Missing required element: ${selector}`);
  }

  return element;
};
