import { LoaderFunction, redirect } from "@remix-run/node";

export const loader: LoaderFunction = ({ request }) => {
  return redirect(`${request.url}/profile`);
};
