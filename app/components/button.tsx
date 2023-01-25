import type { FC } from "react";
import clsx from "clsx";

type Colors = "primary" | "secondary" | "error";

const variantMap = {
  text: {
    primary: "text-purple-500 active:text-purple-400",
    secondary: "text-slate-500 active:text-slate-400",
    error: "text-red-500 active:text-red-400",
  },

  raised: {
    primary: "bg-purple-500 active:bg-purple-400 text-white",
    secondary: "bg-slate-500 active:bg-slate-400 text-white",
    error: "bg-red-500 active:bg-red-400 text-white disabled:opacity-50",
  },

  outline: {
    primary: "border border-purple-500 active:bg-purple-50 text-purple-500 active:text-purple-400",
    secondary: "border border-slate-500 active:bg-slate-50 text-slate-500 active:text-slate-400",
    error: "border border-red-500 active:bg-red-50 text-red-500 active:text-red-400",
  },
};

interface ButtonProps {
  color?: Colors;
  variant?: keyof typeof variantMap;
  iconLeft?: JSX.Element;
  iconRight?: JSX.Element;
}
const Button: FC<ButtonProps & JSX.IntrinsicElements["button"]> = ({
  className,
  children,
  iconLeft,
  iconRight,
  variant = "raised",
  color = "primary",
  ...rest
}) => {
  return (
    <button
      className={clsx(
        "flex items-center text-sm font-semibold px-4 py-3 rounded-xl outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150",
        variantMap[variant][color],
        className
      )}
      {...rest}
    >
      {iconLeft}
      {iconLeft && <>&nbsp; &nbsp;</>}
      {children}
      {iconRight}
    </button>
  );
};

export { Button };
