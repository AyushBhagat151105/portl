import React from "react";
import { useController, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { TextField, Label, Input, FieldError } from "heroui-native";
import { TextInputProps, useColorScheme } from "react-native";

type FormInputProps<T extends FieldValues> = {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  rules?: Record<string, unknown>;
} & Omit<TextInputProps, "value" | "onChangeText" | "onBlur">;

function FormInputInner<T extends FieldValues>(
  { control, name, label, rules, ...inputProps }: FormInputProps<T>,
  _ref: React.Ref<unknown>,
) {
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
    rules,
  });

  const colorScheme = useColorScheme();
  const placeholderColor = colorScheme === "dark" ? "#a8a29e" : "#78716c";

  return (
    <TextField className="gap-1.5">
      <Label className="text-muted-foreground-light dark:text-muted-foreground-dark text-xs uppercase tracking-wider font-semibold">
        {label}
      </Label>
      <Input
        value={field.value ?? ""}
        onChangeText={field.onChange}
        onBlur={field.onBlur}
        placeholder={inputProps.placeholder as string}
        placeholderTextColor={placeholderColor}
        className="bg-muted-light dark:bg-muted-dark border border-border-light dark:border-border-dark text-foreground-light dark:text-foreground-dark rounded-xl px-4 py-3 text-sm focus:border-primary-light dark:focus:border-primary-dark"
        {...inputProps}
      />
      {error?.message && (
        <FieldError isInvalid className="mt-1" classNames={{ text: "text-rose-500 dark:text-rose-400 text-xs font-medium" }}>
          {error.message}
        </FieldError>
      )}
    </TextField>
  );
}

export const FormInput = React.forwardRef(FormInputInner) as <
  T extends FieldValues,
>(
  props: FormInputProps<T> & React.RefAttributes<unknown>,
) => React.ReactElement;
