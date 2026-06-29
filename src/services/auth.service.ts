import { Amplify } from 'aws-amplify';
import { signIn, signOut, fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId:       import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    },
  },
});

export async function login(username: string, password: string) {
  return signIn({ username, password });
}

export async function logout() {
  return signOut();
}

export async function getAccessToken(): Promise<string | null> {
  try {
    const session = await fetchAuthSession();
    return session.tokens?.accessToken.toString() ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUserService() {
  try {
    return await getCurrentUser();
  } catch {
    return null;
  }
}