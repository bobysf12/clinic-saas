import clsx from "clsx";
import type { FC, HTMLAttributes, ReactNode } from "react";
import { H5 } from "./typography";

const maxWidthSizes = {
  xs: "w-3/12",
  sm: "w-5/12",
  md: "w-7/12",
  lg: "w-9/12",
  xl: "w-11/12",
};

type DialogProps = {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: keyof typeof maxWidthSizes;
  fullWidth?: boolean;
};

export const Dialog = ({ open, onClose, title, children, maxWidth = "sm" }: DialogProps) => {
  return (
    <div
      className={clsx("fixed inset-0 flex flex-col items-center justify-center w-full h-full", {
        "translate-y-0": open,
        "translate-y-full": !open,
      })}
    >
      <div className="fixed bg-slate-500 w-full h-full opacity-50" onClick={onClose} />
      <div className={`bg-white rounded-lg z-10 ${maxWidthSizes[maxWidth]}`}>
        {title && <DialogHeader onClose={onClose}>{title}</DialogHeader>}
        {children}
      </div>
    </div>
  );
};

type DialogHeaderProps = {
  hideCloseButton?: boolean;
  onClose?: () => void;
} & HTMLAttributes<HTMLDivElement>;

const DialogHeader: FC<DialogHeaderProps> = ({ className, title, children, hideCloseButton, onClose, ...rest }) => {
  return (
    <div className={clsx("border-b-[1px] flex flex-row items-center justify-between px-4 py-6", className)} {...rest}>
      <H5>{children}</H5>
      {!hideCloseButton && (
        <button onClick={onClose}>
          <i className="fa-solid fa-x"></i>
        </button>
      )}
    </div>
  );
};

export const DialogContent: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => {
  return <div className={clsx("px-4 py-2", className)} {...rest} />;
};

export const DialogActions: FC<HTMLAttributes<HTMLDivElement>> = ({ className, ...rest }) => {
  return <div className={clsx("border-t-[1px] flex flex-row items-center px-4 py-6", className)} {...rest} />;
};
