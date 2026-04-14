import { HttpError } from "./httpError.js";

export function requireString(value, fieldName) {
  if (typeof value !== "string") {
    throw new HttpError(400, `${fieldName} is required`);
  }

  const trimmedValue = value.trim();
  if (!trimmedValue) {
    throw new HttpError(400, `${fieldName} is required`);
  }

  return trimmedValue;
}

export function requireDefinedValue(value, fieldName) {
  if (value === undefined || value === null) {
    throw new HttpError(400, `${fieldName} is required`);
  }

  return value;
}

export function parseNonNegativeInteger(value, fieldName) {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue < 0) {
    throw new HttpError(400, `${fieldName} must be a non-negative integer`);
  }

  return parsedValue;
}

export function parseOptionalPositiveInteger(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) {
    throw new HttpError(400, `${fieldName} must be a positive integer`);
  }

  return parsedValue;
}