import type { ActionFunction, LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Button } from "~/components/button";
import { createUserSession, getUser } from "~/utils/session.server";
import { authApi } from "~/utils/strapiApi.server";
import { StrapiRequestError } from "~/utils/strapiApi.types";

type LoginForm = {
  email: string;
  password: string;
};

type ActionData = {
  formError?: string;
  fieldErrors?: Partial<LoginForm>;
  fields?: LoginForm;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  if (user) {
    return redirect("/app");
  }
  return json({});
};

export const action: ActionFunction = async ({ request }): Promise<Response | ActionData> => {
  const { email, password } = Object.fromEntries(await request.formData());

  if (typeof email !== "string" || typeof password !== "string") {
    return json(
      {
        formError: `Form not submitted correctly.`,
      },
      {
        status: 400,
      }
    );
  }

  const fields = { email, password };
  try {
    const res = await authApi.login(email, password);
    return createUserSession(res, "/app");
  } catch (err) {
    if (err instanceof StrapiRequestError) {
      return json({ fields, formError: err.message });
    }
  }
  return json({ fields, formError: `Something is wrong. Unable to register` });
};

export default function Index() {
  const actionData = useActionData<ActionData | undefined>();

  return (
    <Form method="post">
      <div className="border rounded max-w-md px-4 py-4">
        <h1 className="text-xl font-bold mb-5">Masuk</h1>
        <div className="mb-3 pt-0">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="px-2 py-1 placeholder-gray-300 text-gray-500 relative bg-white rounded text-md border border-gray-300 outline-none focus:outline-none focus:shadow-outline w-full"
          />

          {actionData?.fieldErrors?.email ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.email}
            </p>
          ) : null}
        </div>
        <div className="mb-3 pt-0">
          <input
            type="password"
            name="password"
            placeholder="Password"
            className="px-2 py-1 placeholder-gray-300 text-gray-500 relative bg-white rounded text-md border border-gray-300 outline-none focus:outline-none focus:shadow-outline w-full"
          />

          {actionData?.fieldErrors?.password ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.password}
            </p>
          ) : null}
        </div>

        <div id="form-error-message">
          {actionData?.formError ? (
            <p className="form-validation-error" role="alert">
              {actionData.formError}
            </p>
          ) : null}
        </div>
        <div className="mb-3 pt-0">
          <Button>Masuk</Button>
        </div>
      </div>
    </Form>
  );
}
