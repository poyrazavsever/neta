import { dispatchApiV1 } from "@/server/api/v1/dispatch";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ path: string[] }> };
function handle(request: Request, context: RouteContext) { return context.params.then(({ path }) => dispatchApiV1(request, path)); }
export function GET(request: Request, context: RouteContext) { return handle(request, context); }
export function POST(request: Request, context: RouteContext) { return handle(request, context); }
export function PUT(request: Request, context: RouteContext) { return handle(request, context); }
export function PATCH(request: Request, context: RouteContext) { return handle(request, context); }
export function DELETE(request: Request, context: RouteContext) { return handle(request, context); }
