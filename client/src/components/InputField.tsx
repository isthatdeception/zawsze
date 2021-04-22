// static imports
import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea,
} from "@chakra-ui/react";
import { useField } from "formik";
import React, { InputHTMLAttributes } from "react";

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  name: string;
  label: string;
  textarea?: boolean;
};

// unused varriable like size are off the props
export const InputField: React.FC<InputFieldProps> = ({
  label,
  size: _,
  textarea,
  ...props
}) => {
  // for redundant measures to make it possible to have both input and text area
  // on our same input field
  let CommonField: any;
  CommonField = Input;
  if (textarea) {
    CommonField = Textarea;
  }

  const [field, { error }] = useField(props);

  /**
   *  here error is a string
   *  but is invalid takes a boolean so we will do
   *  '' -> false
   *  'some error stuff' -> going to be true
   *  here error is a string
   *  but is invalid takes a boolean so we will do
   *  ' ' -> false
   *  'some error stuff' -> going to be true
   */

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{label}</FormLabel>
      <CommonField
        {...field}
        {...props}
        id={field.name}
        placeholder={props.placeholder}
      />
      {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
    </FormControl>
  );
};
