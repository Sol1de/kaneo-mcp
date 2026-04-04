import { createMiddleware } from "hono/factory";

export type AuthVariables = {
  kaneoToken: string;
};

export const authMiddleware = createMiddleware<{
  Variables: AuthVariables;
}>(async (c, next) => {
  const auth = c.req.header("authorization");

  if (!auth?.startsWith("Bearer ")) {
    return c.json(
      { error: "Missing or invalid Authorization: Bearer <token>" },
      401,
    );
  }

  c.set("kaneoToken", auth.slice(7));
  await next();
});
