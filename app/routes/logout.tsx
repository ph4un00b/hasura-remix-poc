import {destroySession} from "~/utils/session.server";
import {admin} from "~/utils/firebase.server";
import {getSessionData} from "~/utils/auth.server";
import { ActionFunction, LoaderFunction, redirect } from "@remix-run/node";

export const loader: LoaderFunction = async ({request}) => {
  return redirect("/");
};

export const action: ActionFunction = async ({request}) => {
  const {session, idToken} = await getSessionData(request, true);
  const jwtToken = await admin.auth().verifySessionCookie(idToken!);
  await admin.auth().revokeRefreshTokens(jwtToken.sub);
  return redirect("/", {
    headers: {"Set-Cookie": await destroySession(session)}
  });
};
