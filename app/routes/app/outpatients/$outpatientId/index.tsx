import { LoaderFunction, redirect } from "@remix-run/node";

export const loader: LoaderFunction = ({ params }) => {
  return redirect(`/app/outpatients/${params.outpatientId}/soap`);
};
