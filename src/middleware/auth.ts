import { createMiddleware } from "hono/factory";
import type { AuthVariables } from "../types/index.js";

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  const auth = c.req.header("authorization");
  const tokenFromQuery = c.req.query("token");

  const token = auth?.startsWith("Bearer ")
    ? auth.slice(7)
    : tokenFromQuery;

  console.error(`[AUTH] ${c.req.method} ${c.req.path} hasAuthHeader=${!!auth} hasQueryToken=${!!tokenFromQuery} tokenResolved=${!!token}`);

  if (!token) {
    console.error(`[AUTH] Rejected: no token found`);
    return c.json(
      { error: "Missing or invalid Authorization: Bearer <token> or ?token= query parameter" },
      401,
    );
  }

  c.set("kaneoToken", token);
  await next();
});
