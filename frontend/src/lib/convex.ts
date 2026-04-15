import { ConvexReactClient } from "convex/react";

const url = import.meta.env.VITE_CONVEX_URL as string | undefined;

export const convex = new ConvexReactClient(url ?? "https://missing-convex-url.invalid");
