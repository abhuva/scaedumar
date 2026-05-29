export const CONTENT_VALIDATION_ERROR_CODE = "CONTENT_VALIDATION_FAILED";

export function formatMissingContentReferences(validation) {
  return (validation?.missing || [])
    .map((entry) => `${entry.source} -> ${entry.contentId}`)
    .join("\n");
}

export function formatContentValidationError(error) {
  if (!isContentValidationError(error)) {
    return error && error.message ? error.message : String(error || "Unknown content validation error.");
  }
  const phase = error.phase ? `${error.phase}: ` : "";
  const details = error.details || formatMissingContentReferences(error.validation);
  return `Content validation failed.\n${phase}${details}`;
}

export function createContentValidationError(phase, validation) {
  const details = formatMissingContentReferences(validation);
  const message = `Content validation failed. ${phase}: ${details}`;
  const error = new Error(message);
  error.name = "ContentValidationError";
  error.code = CONTENT_VALIDATION_ERROR_CODE;
  error.phase = phase;
  error.validation = validation;
  error.details = details;
  return error;
}

export function isContentValidationError(error) {
  return Boolean(error && error.code === CONTENT_VALIDATION_ERROR_CODE);
}
