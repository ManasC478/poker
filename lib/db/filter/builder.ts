import { BuilderFn } from "@/lib/types";

export const sessionLocked: BuilderFn<boolean> = (query, value) => query.eq('locked', value);
