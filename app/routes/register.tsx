import { ActionFunction, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Button } from "~/components/button";

type ActionData = {
  formError?: string;
  fieldErrors?: { name: string | undefined; email: string | undefined; password: string | undefined };
  fields?: { name: string; email: string; password: string };
  result: any;
};

export const action: ActionFunction = async ({ request }): Promise<Response | ActionData> => {
  const { name, email, password } = Object.fromEntries(await request.formData());

  if (typeof name !== "string" || typeof email !== "string" || typeof password !== "string") {
    return json(
      {
        formError: `Form not submitted correctly.`,
      },
      {
        status: 400,
      }
    );
  }

  const fields = { name, email, password };
  let result;

  try {
    const res = await fetch("http://localhost:1337/api/auth/local/register", {
      method: "post",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ name, email, password, username: email }),
    });

    if (res.status === 200) {
      // Set jwt cookie
      // Set user cookie
    }
    result = await res.json();
    console.log(result);
  } catch (err) {
    console.log(err);
  }

  return { fields, formError: `Unable to register`, result };
};

export default function Index() {
  const actionData = useActionData<ActionData | undefined>();
  console.log(actionData);
  return (
    <Form method="post">
      <div className="border rounded max-w-md px-4 py-4">
        <h1 className="text-xl font-bold mb-5">Buat akun baru</h1>
        <div className="mb-3 pt-0">
          <input
            type="text"
            name="name"
            placeholder="Nama"
            className="px-2 py-1 placeholder-gray-300 text-gray-500 relative bg-white rounded text-md border border-gray-300 outline-none focus:outline-none focus:shadow-outline w-full"
          />

          {actionData?.fieldErrors?.name ? (
            <p className="form-validation-error" role="alert" id="name-error">
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
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
          <Button>Daftar</Button>
        </div>
      </div>
    </Form>
  );
}
