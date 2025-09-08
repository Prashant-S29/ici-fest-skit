export const getEndpoint = (path: string) => {
  return process.env.NODE_ENV === "production"
    ? `https://ici-fest-skit.vercel.app/${path}`
    : `http://localhost:3000/${path}`;
};
