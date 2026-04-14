export function parseRequiredNumber(value, fieldLabel) {
  if (value === undefined || value === null || `${value}`.trim() === "") {
    throw new Error(`${fieldLabel} is required.`);
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`${fieldLabel} must be a valid number.`);
  }

  return parsedValue;
}

export function parseRequiredText(value, fieldLabel) {
  if (value === undefined || value === null) {
    throw new Error(`${fieldLabel} is required.`);
  }

  const trimmedValue = `${value}`.trim();

  if (!trimmedValue) {
    throw new Error(`${fieldLabel} is required.`);
  }

  return trimmedValue;
}

export function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  if (error && typeof error.message === "string") {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred.";
}