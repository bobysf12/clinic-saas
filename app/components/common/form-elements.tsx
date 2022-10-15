import clsx from "clsx";
import React from "react";

export const Label = ({ className, ...props }: JSX.IntrinsicElements["label"]) => {
  return <label className={clsx("text-sm text-slate-500")} {...props} />;
};

type InputProps = ({ type: "textarea" } & JSX.IntrinsicElements["textarea"]) | JSX.IntrinsicElements["input"];
const inputCss =
  "placeholder-gray-500 focus-ring p-3 w-full text-black disabled:text-gray-400 text-lg font-medium bg-gray-100 rounded-lg";
export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const className = clsx(inputCss, props.className);

  if (props.type === "textarea") {
    return <textarea {...(props as JSX.IntrinsicElements["textarea"])} className={className} />;
  }

  return <input {...(props as JSX.IntrinsicElements["input"])} className={className} ref={ref} />;
});

interface InputErrorProps {
  id: string;
  children?: string | null;
}

function InputError({ children, id }: InputErrorProps) {
  if (!children) {
    return null;
  }

  return (
    <p role="alert" id={id} className="text-sm text-red-500">
      {children}
    </p>
  );
}

export const InputField = React.forwardRef<
  HTMLInputElement,
  {
    defaultValue?: string | null;
    name: string;
    label?: string;
    className?: string;
    error?: string | null;
    description?: React.ReactNode;
  } & InputProps
>(function Field({ defaultValue, error, name, label, className, description, id, ...props }, ref) {
  const inputId = id ?? `${name}`;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;

  return (
    <div className={clsx("mb-4", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        {label && <Label htmlFor={inputId}>{label}</Label>}
        {error ? (
          <InputError id={errorId}>{error}</InputError>
        ) : description ? (
          <div id={descriptionId} className="text-primary text-lg">
            {description}
          </div>
        ) : null}
      </div>

      <Input
        // @ts-expect-error no idea 🤷‍♂️
        ref={ref}
        {...(props as InputProps)}
        name={name}
        id={inputId}
        autoComplete={name}
        defaultValue={defaultValue}
        aria-describedby={error ? errorId : description ? descriptionId : undefined}
      />
    </div>
  );
});

export const SelectField = React.forwardRef<
  HTMLSelectElement,
  {
    defaultValue?: string | null;
    name: string;
    label: string;
    className?: string;
    error?: string | null;
    description?: React.ReactNode;
  } & JSX.IntrinsicElements["select"]
>(function SelectField({ defaultValue, error, name, label, className, description, id, ...props }, ref) {
  const inputId = id ?? `${name}`;
  const errorId = `${inputId}-error`;
  const descriptionId = `${inputId}-description`;

  return (
    <div className={clsx("mb-4", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <Label htmlFor={inputId}>{label}</Label>
        {error ? (
          <InputError id={errorId}>{error}</InputError>
        ) : description ? (
          <div id={descriptionId} className="text-primary text-lg">
            {description}
          </div>
        ) : null}
      </div>

      <select
        ref={ref}
        className={inputCss}
        {...(props as JSX.IntrinsicElements["select"])}
        name={name}
        id={inputId}
        defaultValue={defaultValue}
        aria-describedby={error ? errorId : description ? descriptionId : undefined}
      />
    </div>
  );
});
