import { getRequestConfig } from 'next-intl/server';
 
export default getRequestConfig(async () => {
  // Provide a static locale, read from cookie, header, etc.
  const locale = 'en';
 
  return {
    locale,
    messages: (await import(`../locales/${locale}/common.json`)).default
  };
});
