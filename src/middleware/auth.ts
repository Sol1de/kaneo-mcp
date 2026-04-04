import { createMiddleware } from "hono/factory";

export type AuthVariables = {
  kaneoToken: string;
};

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  const auth = c.req.header("authorization");
  const tokenFromQuery = c.req.query("token");

  const token = auth?.startsWith("Bearer ")
    ? auth.slice(7)
    : tokenFromQuery;

  if (!token) {
    return c.json(
      { error: "Missing or invalid Authorization: Bearer <token> or ?token= query parameter" },
      401,
    );
  }

  c.set("kaneoToken", token);
  await next();
});
