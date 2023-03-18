import { json, LoaderFunction } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { requireAuthenticatedUser } from "~/utils/session.server";
import styles from "~/styles/dashboard.css";
import MenuItem from "~/components/Sidebar/MenuItem";
import { useEffect, useState } from "react";
import clsx from "clsx";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await requireAuthenticatedUser(request);

  return json({ user });
};

const sidebarMenus = [
  { icon: "fa-solid fa-house", name: "Beranda", redirectTo: "/app" },
  { icon: "fa-solid fa-stethoscope", name: "Rawat Jalan", redirectTo: "/app/outpatients" },
  { icon: "fa-solid fa-hospital-user", name: "Pasien", redirectTo: "/app/patients" },
];

export default function App() {
  const { user } = useLoaderData();
  const [showSidebar, setShowSidebar] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleCollapseSidebar = () => {
    if (window.innerWidth < 768) {
      setShowSidebar((open) => !open);
    } else {
      setIsSidebarCollapsed((open) => !open);
    }
  };

  return (
    <div>
      <nav
        className="fixed top-0 left-0 w-full h-16 flex flex-row items-center px-6 z-50"
        style={{ backgroundColor: "var(--app-bg-color)" }}
      >
        <button className="mr-4" onClick={toggleCollapseSidebar}>
          <i className="fa-solid fa-bars"></i>
        </button>
        <span className="text-xl font-bold">{user.organization.name}</span>
        <div className="flex-1" />
        <span className="font-medium mr-2 hidden sm:block ">{user.username}</span>
        <form action="/logout" method="post">
          <button className="font-bold uppercase text-red-600" type="submit">
            <i className="fa-solid fa-power-off"></i>
          </button>
        </form>
      </nav>

      {/* Desktop */}
      <nav className={clsx("hidden md:flex fixed left-0 h-full flex-col px-4", { "w-64": !isSidebarCollapsed })}>
        <ul>
          {sidebarMenus.map((menu) => (
            <MenuItem
              key={menu.redirectTo}
              to={menu.redirectTo}
              iconClassName={menu.icon}
              iconOnly={isSidebarCollapsed}
            >
              {menu.name}
            </MenuItem>
          ))}
        </ul>
      </nav>

      {/* Mobile */}
      <div>
        <nav
          className={clsx("md:hidden fixed left-0 h-full flex flex-col px-4 w-64 duration-200 transition-width z-20", {
            hidden: !showSidebar,
          })}
          style={{ backgroundColor: "var(--app-bg-color)" }}
        >
          <ul>
            {sidebarMenus.map((menu) => (
              <MenuItem
                key={menu.redirectTo}
                to={menu.redirectTo}
                iconClassName={menu.icon}
                iconOnly={false}
                onClick={toggleCollapseSidebar}
              >
                {menu.name}
              </MenuItem>
            ))}
          </ul>
        </nav>
        <div
          onClick={toggleCollapseSidebar}
          className={clsx("bg-gray-900 fixed inset-0 opacity-50 z-10 md:hidden", { hidden: !showSidebar })}
        />
      </div>

      <main className={clsx("mt-16 p-6 md:ml-64", { "md:ml-24": isSidebarCollapsed })}>
        <Outlet />
      </main>
    </div>
  );
}
