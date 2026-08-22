import { BuilderFn } from "@/lib/types";

export const sessionLockedBuilder: BuilderFn<boolean> = (query, value) => query.eq('locked', value);
