export type ActionResult<T = object> =
  | ({ ok: true } & T)
  | { ok: false; error?: string; fieldErrors?: Record<string, string> };
