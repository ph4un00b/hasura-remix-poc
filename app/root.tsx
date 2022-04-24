import { json, MetaFunction, redirect } from "@remix-run/node";
import { Meta, Links, LiveReload, Outlet, Scripts, ScrollRestoration, useFetcher, useLoaderData } from "@remix-run/react";
import {
  AuthenticityTokenInput,
  AuthenticityTokenProvider,
  createAuthenticityToken,
  useShouldHydrate,
} from "remix-utils";

import {commitSession} from "~/utils/session.server";
import {getSessionData} from "./utils/auth.server";

interface LoaderData {
  csrf?: string;
  isLoggedIn: boolean;
  ENV: Record<string, string>
}

// Setup CSRF token only if they are heading to the login page.
// Usually we would assign a CSRF token to everyone but
// with Firebase Hosting caching is tied to the cookie.
// If someone isn't logged in we want them to hit the public cache

// https://firebase.google.com/docs/hosting/manage-cache
export async function action({request}: { request: Request }) {
  let {session} = await getSessionData(request);

  // Add CSRF token to session
  createAuthenticityToken(session);

  return redirect("/login", {
    headers: {"Set-Cookie": await commitSession(session)},
  });
}

export async function loader({request}: { request: Request }) {
  const {csrf, idToken} = await getSessionData(request);
  return json<LoaderData>({
    csrf,
    isLoggedIn: !!idToken,
    ENV: {
      FIREBASE_ADMIN_SERVICE_ACCOUNT: process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT!
    }
  });
}

export const meta: MetaFunction = () => ({
  charset: "utf-8",
  title: "New Remix App",
  viewport: "width=device-width,initial-scale=1",
});

export default function App() {
  // Control if page loads JS https://github.com/sergiodxa/remix-utils#useshouldhydrate
  const shouldHydrate = useShouldHydrate();

  const fetcher = useFetcher();

  const {csrf, isLoggedIn, ENV} = useLoaderData<LoaderData>();

  return (
    <html lang="en">
    <head>
      <meta charSet="utf-8"/>
      <meta name="viewport" content="width=device-width,initial-scale=1"/>
      <meta name="robots" content="noindex"/>
      <Meta/>
      <title>hasura jamon!</title>
      <Links/>
    </head>
    <body style={{margin: 0}}>
    <AuthenticityTokenProvider token={csrf || ""}>
      <nav style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
        <a href="/">Home</a>
        {/* We use fetcher.Form instead of Form because we dont want navigation events */}
        {isLoggedIn ? (
          <fetcher.Form action="/logout" method="post" replace>
            <AuthenticityTokenInput/>
            <button type="submit">Logout</button>
          </fetcher.Form>
        ) : (
          <fetcher.Form action="/" method="post" replace>
            <button type="submit">Login</button>
          </fetcher.Form>
        )}
      </nav>
      <Outlet/>
    </AuthenticityTokenProvider>
    <ScrollRestoration/>
    {shouldHydrate && (
      <>
        <script dangerouslySetInnerHTML={{__html: `window.ENV = ${JSON.stringify(ENV)}`}}/>
        <Scripts/>
      </>
    )}
    {process.env.NODE_ENV === "development" && <LiveReload/>}
    </body>
    </html>
  );
}
