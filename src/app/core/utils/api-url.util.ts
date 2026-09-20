/** Match the API origin and path before attaching credentials or bearer tokens. */
export function isApiRequest(requestUrl: string, apiBaseUrl: string): boolean {
  const absolute = /^https?:\/\//i;
  const relative = (value: string) => value.startsWith('/') && !value.startsWith('//') && !value.includes('\\');
  try {
    const baseIsAbsolute = absolute.test(apiBaseUrl);
    if (!baseIsAbsolute && !relative(apiBaseUrl)) return false;
    // A relative request resolves against the page, not an external API origin.
    if (baseIsAbsolute ? !absolute.test(requestUrl) : !relative(requestUrl)) return false;
    const base = new URL(apiBaseUrl, 'https://application.invalid');
    const target = new URL(requestUrl, 'https://application.invalid');
    const path = base.pathname.replace(/\/+$/, '');
    return !target.username && !target.password && target.origin === base.origin &&
      (path === '' || target.pathname === path || target.pathname.startsWith(`${path}/`));
  } catch {
    return false;
  }
}
