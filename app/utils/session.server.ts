/* eslint-disable @typescript-eslint/consistent-type-imports */
import { createCookieSessionStorage, redirect } from "@remix-run/node";
import { authApi, LoginResponse } from "./strapiApi.server";

enum SessionKeys {
  TOKEN = "token",
  USER_ID = "user_id",
}

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "session",
    // normally you want this to be `secure: true`
    // but that doesn't work on localhost for Safari
    // https://web.dev/when-to-use-local-https/
    secure: process.env.NODE_ENV === "production",
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true,
  },
});

export async function createUserSession({ user, jwt }: LoginResponse, redirectTo: string) {
  const session = await storage.getSession();
  session.set(SessionKeys.TOKEN, jwt);
  session.set(SessionKeys.USER_ID, user.id);
  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await storage.commitSession(session),
    },
  });
}

export async function getSession(request: Request) {
  return storage.getSession(request.headers.get("Cookie"));
}

export async function getToken(request: Request) {
  const session = await getSession(request);
  const token: string | undefined = session.get(SessionKeys.TOKEN);

  return token;
}

export async function logout(request: Request) {
  const session = await getSession(request);
  return redirect("/login", {
    headers: {
      "Set-Cookie": await storage.destroySession(session),
    },
  });
}

export async function requireAuthenticatedUser(request: Request) {
  const session = await getSession(request);
  const token: string | undefined = session.get(SessionKeys.TOKEN);

  if (!token) {
    throw redirect("/login");
  }

  try {
    const user = await getUser(request);
    return { user, token };
  } catch {
    throw redirect("/login");
  }
}

export async function getUser(request: Request) {
  const session = await getSession(request);
  const token = session.get(SessionKeys.TOKEN);

  if (!token) {
    return null;
  }

  try {
    return authApi.getOwnData(token);
  } catch (err) {
    return null;
  }
}
