import { NavLink } from "@remix-run/react";
import type { ReactNode } from "react";

type Props = {
  iconClassName: string;
  to: string;
  children: ReactNode;
};

export default function MenuItem({ children, to, iconClassName }: Props) {
  return (
    <NavLink to={to} end>
      {({ isActive }) => (
        <li
          className={
            "flex flex-row justify-start items-center  px-4 py-2 rounded-lg mb-2 " +
            (isActive ? "bg-slate-100" : "hover:bg-slate-100")
          }
        >
          <div className="shadow-sm rounded-lg px-3 py-2 bg-white mr-4 flex items-center justify-center w-10 h-10">
            <i className={iconClassName + ""}></i>
          </div>
          <span className={isActive ? "font-bold" : "font-normal"}>{children}</span>
        </li>
      )}
    </NavLink>
  );
}
