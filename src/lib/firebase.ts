import type { FirebaseApp } from 'firebase/app'
import type { AppCheck } from 'firebase/app-check'
import type { Analytics } from 'firebase/analytics'
import type { Firestore } from 'firebase/firestore'

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

export const hasFirebaseConfig = Boolean(config.apiKey && config.projectId && config.appId)

let appPromise: Promise<FirebaseApp | null> | null = null
let appCheckPromise: Promise<AppCheck | null> | null = null
let firestorePromise: Promise<Firestore | null> | null = null
let analyticsPromise: Promise<Analytics | null> | null = null

async function getFirebaseApp() {
  if (!hasFirebaseConfig) return null
  if (!appPromise) {
    appPromise = import('firebase/app').then(async ({ initializeApp, getApps, getApp }) => {
      const apps = getApps()
      return apps.length ? getApp() : initializeApp(config)
    })
  }
  return appPromise
}

async function getAppCheckClient() {
  if (!appCheckPromise) {
    appCheckPromise = (async () => {
      const app = await getFirebaseApp()
      const enterpriseSiteKey = import.meta.env.VITE_RECAPTCHA_ENTERPRISE_SITE_KEY
      const v3SiteKey = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY
      const siteKey = enterpriseSiteKey || v3SiteKey
      if (!app || !siteKey) return null
      const {
        initializeAppCheck,
        ReCaptchaEnterpriseProvider,
        ReCaptchaV3Provider,
      } = await import('firebase/app-check')
      return initializeAppCheck(app, {
        provider: enterpriseSiteKey
          ? new ReCaptchaEnterpriseProvider(siteKey)
          : new ReCaptchaV3Provider(siteKey),
        isTokenAutoRefreshEnabled: true,
      })
    })()
  }
  return appCheckPromise
}

export async function getAppCheckToken() {
  const appCheck = await getAppCheckClient()
  if (!appCheck) return null
  const { getToken } = await import('firebase/app-check')
  return (await getToken(appCheck, false)).token
}

export async function getFirestoreClient() {
  if (!firestorePromise) {
    firestorePromise = (async () => {
      const app = await getFirebaseApp()
      if (!app) return null
      const { getFirestore } = await import('firebase/firestore')
      return getFirestore(app)
    })()
  }
  return firestorePromise
}

export async function getAnalyticsClient() {
  if (!analyticsPromise) {
    analyticsPromise = (async () => {
      const app = await getFirebaseApp()
      if (!app) return null
      const { getAnalytics, isSupported } = await import('firebase/analytics')
      return (await isSupported()) ? getAnalytics(app) : null
    })()
  }
  return analyticsPromise
}
