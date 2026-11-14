import type { ComponentPropsWithRef } from "react";

type ValueProps = {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
  look?: "field" | "compact" | "bare";
  fit?: boolean;
};

export type TextInputProps = Omit<ComponentPropsWithRef<"input">, "value" | "defaultValue" | "onChange" | "type"> &
  ValueProps & { type?: "text" | "password" | "number" | "search" };

export type TextAreaProps = Omit<ComponentPropsWithRef<"textarea">, "value" | "defaultValue" | "onChange"> &
  ValueProps & { resize?: "vertical" | "none" };

export function TextInput({
  onChange,
  invalid,
  look = "field",
  fit = false,
  type = "text",
  className = "",
  ...props
}: TextInputProps) {
  return (
    // design-allow: 统一单行输入框组件的内部实现。
    <input
      {...props}
      type={type}
      data-look={look === "field" ? undefined : look}
      data-fit={fit || undefined}
      aria-invalid={invalid ?? props["aria-invalid"]}
      onChange={(e) => onChange(e.target.value)}
      className={`trm-input ${className}`}
    />
  );
}

export function TextArea({
  onChange,
  invalid,
  look = "field",
  fit = false,
  resize = "vertical",
  rows = 3,
  className = "",
  ...props
}: TextAreaProps) {
  return (
    // design-allow: 统一多行输入框组件的内部实现。
    <textarea
      {...props}
      rows={rows}
      data-look={look === "field" ? undefined : look}
      data-fit={fit || undefined}
      data-resize={resize === "vertical" ? undefined : resize}
      aria-invalid={invalid ?? props["aria-invalid"]}
      onChange={(e) => onChange(e.target.value)}
      className={`trm-input trm-textarea ${className}`}
    />
  );
}
