import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import clsx from "clsx";
import React from "react";

export const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuPrimitive.DropdownMenuContentProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          className={clsx("w-48 rounded-lg px-2 py-1 shadow-md md:w-56 bg-white", props.className)}
          {...props}
          ref={forwardedRef}
        >
          {children}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    );
  }
);

export const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuPrimitive.DropdownMenuItemProps>(
  ({ children, ...props }, forwardedRef) => {
    return (
      <DropdownMenuPrimitive.Item
        ref={forwardedRef}
        className={clsx("cursor-default select-none rounded-md px-2 py-2 text-xs outline-none", props.className)}
      >
        {children}
      </DropdownMenuPrimitive.Item>
    );
  }
);

DropdownMenuContent.displayName = "DropdownMenuContent";
DropdownMenuItem.displayName = "DropdownMenuItem";
