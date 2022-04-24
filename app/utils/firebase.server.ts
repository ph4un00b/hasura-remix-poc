import * as admin from "firebase-admin";
import {initializeApp, ServiceAccount} from "firebase-admin/app";
import service from "_configs/firebase-admin.json";

// console.log(service)
// console.log(JSON.parse(process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT!))

if (admin.apps.length === 0) {
  initializeApp({
    credential: admin.credential.cert(service as ServiceAccount),
  });
}

export {admin};
