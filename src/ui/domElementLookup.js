export function getRequiredElementById(id) {
  const el = document.getElementById(id);
  if (!el) {
    throw new Error(`Missing required element with id '${id}'.`);
  }
  return el;
}

export function getRequiredElements(selector) {
  const els = Array.from(document.querySelectorAll(selector));
  if (els.length === 0) {
    throw new Error(`Missing required elements for selector '${selector}'.`);
  }
  return els;
}
