import type { MetaFunction } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";
import { setDefaultOptions } from "date-fns";
import id from "date-fns/locale/id";
import styles from "./styles/app.css";
import globalStyles from "./styles/global.css";

setDefaultOptions({ locale: id });

export function links() {
  return [{ rel: "stylesheet", href: styles }, { rel: "stylesheet", href: globalStyles }, { rel: "" }];
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <script src="https://kit.fontawesome.com/f700e25574.js" crossOrigin="anonymous"></script>
      </head>
      <body>
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
