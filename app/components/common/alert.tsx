import { Alert as BaseAlert } from "@reach/alert";
import clsx from "clsx";
import { ReactNode } from "react";

export const Alert = ({
  children,
  type,
  className,
}: {
  type: "warning" | "error" | "info";
  children: ReactNode;
  className?: string;
}) => {
  return (
    <BaseAlert
      type="assertive"
      className={clsx("px-6 py-4 rounded-2xl", className, {
        "bg-red-400": type === "error",
        "bg-yellow-200": type === "warning",
        "bg-blue-200": type === "info",
      })}
    >
      {children}
    </BaseAlert>
  );
};
