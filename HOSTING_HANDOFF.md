# NNC B2B Rewards Hosting Copy

This folder is a standalone source copy of the live NNC B2B Rewards landing
route: `/lp/nnc-b2b-online-rewards-q3-2026`.

The copy intentionally excludes `.git`, `node_modules`, `dist`, `.env`, and
`.firebaserc`. It cannot deploy to the existing Firebase project by accident.

## Start locally

```powershell
npm.cmd ci
npm.cmd run dev
```

## Create the new Hosting project

1. Create or select the new Firebase project in the Firebase Console.
2. Run `firebase.cmd login` if needed.
3. Run `firebase.cmd use --add` and select the new project.
4. Build with `npm.cmd run build`.
5. Deploy Hosting with `firebase.cmd deploy --only hosting`.

Do not copy the original `.env`. Create the new project's environment values
from `.env.example`, then configure its Firestore and Analytics ownership
deliberately before opening the public form.
