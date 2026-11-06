import type { ComponentPropsWithRef } from "react";

type ValueProps = {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
};

export type TextInputProps = Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue" | "onChange" | "type"> &
  ValueProps & { type?: "text" | "password" | "number" };

export type TextAreaProps = Omit<ComponentPropsWithRef<"textarea">, "value" | "defaultValue" | "onChange"> & ValueProps;

export function TextInput({ onChange, invalid, type = "text", className = "", ...props }: TextInputProps) {
  return (
    <input
      {...props}
      type={type}
      aria-invalid={invalid ?? props["aria-invalid"]}
      onChange={(e) => onChange(e.target.value)}
      className={`trm-input ${className}`}
    />
  );
}

export function TextArea({ onChange, invalid, rows = 3, className = "", ...props }: TextAreaProps) {
  return (
    <textarea
      {...props}
      rows={rows}
      aria-invalid={invalid ?? props["aria-invalid"]}
      onChange={(e) => onChange(e.target.value)}
      className={`trm-input trm-textarea ${className}`}
    />
  );
}
