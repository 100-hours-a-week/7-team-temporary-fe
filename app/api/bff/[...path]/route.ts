import { createProxyRouteHandlers } from "../../_proxy/route-handler";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const handlers = createProxyRouteHandlers("legacy");

export const GET = handlers.GET;
export const POST = handlers.POST;
export const PUT = handlers.PUT;
export const PATCH = handlers.PATCH;
export const DELETE = handlers.DELETE;
export const HEAD = handlers.HEAD;
export const OPTIONS = handlers.OPTIONS;
