import clsx from "clsx";
import type { FC, HTMLAttributes, ReactNode } from "react";
import { H5 } from "./typography";

const maxWidthSizes = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

type DialogProps = {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  children: ReactNode;
  maxWidth?: keyof typeof maxWidthSizes;
  fullWidth?: boolean;
};

export const Dialog = ({ open, onClose, title, children, maxWidth = "sm", fullWidth }: DialogProps) => {
  return (
    <div
      className={clsx(
        "fixed inset-0 overflow-x-hidden overflow-y-auto bg-slate-500 bg-opacity-50 backdrop-blur-sm items-center justify-center flex",
        {
          "translate-y-0": open,
          "translate-y-full": !open,
        }
      )}
      style={{ zIndex: 1000 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => {
          // do not close modal if anything inside modal content is clicked
          e.stopPropagation();
        }}
        className={clsx(`m-auto bg-white rounded-lg ${maxWidthSizes[maxWidth]}`, { "w-full": fullWidth })}
      >
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
