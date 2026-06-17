import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const getApiKey = () => {
  const envKey = import.meta.env.VITE_FIREBASE_API_KEY;
  if (envKey && typeof envKey === 'string' && envKey.trim() !== '' && envKey.startsWith('AIzaSy')) {
    return envKey;
  }
  return "AIzaSyCE0NpeutC5M9kNcCIjjre8c2mJPDtr6NI";
};

const getProjectId = () => {
  const envVal = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  if (envVal && typeof envVal === 'string' && envVal.trim() !== '' && !envVal.startsWith('VITE_') && envVal !== 'MY_FIREBASE_PROJECT_ID') {
    return envVal;
  }
  return "shahi-khana-b79a1";
};

const getAuthDomain = () => {
  const envVal = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
  if (envVal && typeof envVal === 'string' && envVal.trim() !== '' && !envVal.startsWith('VITE_') && envVal !== 'MY_FIREBASE_AUTH_DOMAIN') {
    return envVal;
  }
  return "shahi-khana-b79a1.firebaseapp.com";
};

const getStorageBucket = () => {
  const envVal = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
  if (envVal && typeof envVal === 'string' && envVal.trim() !== '' && !envVal.startsWith('VITE_') && envVal !== 'MY_FIREBASE_STORAGE_BUCKET') {
    return envVal;
  }
  return "shahi-khana-b79a1.firebasestorage.app";
};

const getMessagingSenderId = () => {
  const envVal = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  if (envVal && typeof envVal === 'string' && envVal.trim() !== '' && !envVal.startsWith('VITE_') && envVal !== 'MY_FIREBASE_MESSAGING_SENDER_ID') {
    return envVal;
  }
  return "10053620669";
};

const getAppId = () => {
  const envVal = import.meta.env.VITE_FIREBASE_APP_ID;
  if (envVal && typeof envVal === 'string' && envVal.trim() !== '' && !envVal.startsWith('VITE_') && envVal !== 'MY_FIREBASE_APP_ID') {
    return envVal;
  }
  return "1:10053620669:web:668bdcb936be7f15fbb8d4";
};

const firebaseConfig = {
  apiKey: getApiKey(),
  authDomain: getAuthDomain(),
  projectId: getProjectId(),
  storageBucket: getStorageBucket(),
  messagingSenderId: getMessagingSenderId(),
  appId: getAppId()
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
