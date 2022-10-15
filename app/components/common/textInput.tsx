import clsx from "clsx";
import type { HTMLAttributes } from "react";
import React from "react";

type Props = {
  fullWidth?: boolean;
} & HTMLAttributes<HTMLDivElement>;

export const TextInput = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  return <input ref={ref} {...props} className={clsx("border rounded-lg bg-transparent focus:ring-2")} />;
});

TextInput.displayName = "TextInput";
