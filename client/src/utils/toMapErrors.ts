import { FieldError } from "../generated/graphql";

// to map errors
// server side validation
// error fecthing from the server
export const toMapErrors = (errors: FieldError[]) => {
  const mapErrors: Record<string, string> = {};
  errors.forEach(({ field, message }) => {
    mapErrors[field] = message;
  });

  // returning the end result of our utility toMAPERRORS
  return mapErrors;
};
