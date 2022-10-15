import { json, LoaderFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { requireAuthenticatedUser } from "~/utils/session.server";
import styles from "~/styles/dashboard.css";
import MenuItem from "~/components/Sidebar/MenuItem";

export const links = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const loader: LoaderFunction = async ({ request }) => {
  const { user } = await requireAuthenticatedUser(request);

  return json({ user });
};

export default function App() {
  return (
    <div>
      <nav
        className="fixed top-0 left-0 w-full h-16 flex flex-row items-center px-6"
        style={{ backgroundColor: "var(--app-bg-color)" }}
      >
        <span className="text-xl font-bold">Remix Starter Dashboard</span>
        <div className="flex-1" />
        <form action="/logout" method="post">
          <button className="font-bold uppercase" type="submit">
            Logout
          </button>
        </form>
      </nav>
      <nav className="fixed left-0 h-full flex flex-col px-6 w-64">
        <ul>
          <MenuItem to="/app" iconClassName="fa-solid fa-house">
            Dashboard
          </MenuItem>
          <MenuItem to="/app/patients" iconClassName="fa-solid fa-person">
            Patients
          </MenuItem>
          <MenuItem to="/app/settings" iconClassName="fa-solid fa-gear">
            Settings
          </MenuItem>
        </ul>
      </nav>
      <main className="mt-16 ml-64 p-6">
        <Outlet />
      </main>
    </div>
  );
}
