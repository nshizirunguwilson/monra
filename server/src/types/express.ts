import type { Request } from "express";

export type IdParams = Request<{ id: string }>;
