export const getEndpoint = (path: string) => {
  return process.env.NODE_ENV === "production"
    ? `https://icifest.skit.ac.in/${path}`
    : `http://localhost:3000/${path}`;
};
