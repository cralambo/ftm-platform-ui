import type { ChangeEventHandler } from "react";
import type { FormikProps } from "formik";

/** Props communes d'un TextField MUI branché sur Formik. */
export function fieldProps<T>(f: FormikProps<T>, name: keyof T & string) {
  const field = f.getFieldProps(name);
  const touched = Boolean((f.touched as Record<string, unknown>)[name]);
  const error = (f.errors as Record<string, unknown>)[name] as string | undefined;
  const hasError = touched && Boolean(error);

  return {
    name: field.name,
    value: (field.value ?? "") as string | number,
    onChange: field.onChange as ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>,
    onBlur: field.onBlur,
    fullWidth: true,
    error: hasError,
    helperText: hasError ? error : " ", // " " évite que le formulaire saute
  };
}