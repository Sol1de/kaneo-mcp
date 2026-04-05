import type { HttpBindings } from "@hono/node-server";
import type { AuthVariables } from "./auth.type.js";

export interface AppEnv {
  Bindings: HttpBindings;
  Variables: AuthVariables;
}
