export const getURL = () => {
  let url =
    process?.env?.NEXT_PUBLIC_SITE_URL ?? // Set this in Vercel 'Production' env vars
    process?.env?.NEXT_PUBLIC_VERCEL_URL ?? // Automatically set by Vercel for Previews
    "http://localhost:3000/";

  // Ensure the URL starts with https:// unless it's localhost
  url = url.startsWith("http") ? url : `https://${url}`;
  // Ensure a trailing slash
  url = url.endsWith("/") ? url : `${url}/`;

  return url;
};
