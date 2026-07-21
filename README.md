# NNC Campaign Platform

Web app quan ly va van hanh nhieu landing page cua NNC Pharma. Repository nay chi chua source dang chay, tai nguyen public, cau hinh Firebase Hosting/Firestore va cac bai kiem thu lien quan.

## Chay local

Yeu cau Node.js 20 tro len.

```powershell
npm install
npm run dev
```

Ung dung mac dinh chay tai `http://localhost:3000`.

## Kiem tra truoc khi phat hanh

```powershell
npm run lint
npm test
npm run build
```

## Cau truc chinh

- `src/`: landing pages, dashboard Lead, auth va cau hinh campaign.
- `public/`: hinh anh va tai nguyen tinh cua cac landing page.
- `firestore.rules`: phan quyen intake Lead va dashboard noi bo.
- `firestore.indexes.json`: index Firestore.
- `firebase.json`: cau hinh Firebase Hosting va route landing page.
- `tests/`: kiem thu ranh gioi bao mat Firestore.

## Trien khai

Build production:

```powershell
npm run build
```

Deploy Firebase Hosting va Firestore sau khi UAT:

```powershell
firebase deploy --only hosting,firestore:rules,firestore:indexes
```

Analytics su dung Firebase/GA4. Dashboard trong ung dung chi doc va quan tri du lieu Lead; repository khong trien khai Cloud Functions.
