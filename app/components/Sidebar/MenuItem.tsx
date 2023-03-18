import { NavLink } from "@remix-run/react";
import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  iconClassName: string;
  to: string;
  children: ReactNode;
  onClick?: () => void;
  iconOnly?: boolean;
};

export default function MenuItem({ children, to, iconClassName, iconOnly, onClick }: Props) {
  return (
    <NavLink to={to} end onClick={onClick}>
      {({ isActive }) => (
        <li
          className={
            "flex flex-row justify-start items-center  px-4 py-2 rounded-lg mb-2 " +
            (isActive ? "bg-slate-100" : "hover:bg-slate-100")
          }
        >
          <div className="shadow-sm rounded-lg px-3 py-2 bg-white flex items-center justify-center w-10 h-10">
            <i className={iconClassName + ""}></i>
          </div>
          {!iconOnly && (
            <span className={clsx({ "font-bold": isActive, "font-light": !isActive }, "text-sm ml-4")}>{children}</span>
          )}
        </li>
      )}
    </NavLink>
  );
}
