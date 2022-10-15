import clsx from "clsx";
import { FC, HTMLAttributes } from "react";

export const Card: FC<HTMLAttributes<HTMLDivElement>> = ({ className, children, ...rest }) => {
  return (
    <div className={clsx("bg-white shadow-lg shadow-gray-200 rounded-2xl p-4", className)} {...rest}>
      {children}
    </div>
  );
};
