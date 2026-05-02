import 'server-only';
import { cookies } from 'next/headers';

// This dynamically imports only the JSON file we need, keeping the app fast!
const dictionaries = {
  en: () => import('@/dictionaries/en.json').then((module) => module.default),
  he: () => import('@/dictionaries/he.json').then((module) => module.default),
};

// Grabs the cookie to see what language the user wants
export const getLocale = async () => {
  const cookieStore = await cookies();
  return cookieStore.get('NEXT_LOCALE')?.value || 'en';
};

// Returns the actual translated text
export const getDictionary = async () => {
  const locale = await getLocale() as keyof typeof dictionaries;
  return dictionaries[locale]();
};