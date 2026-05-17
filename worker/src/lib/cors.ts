const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [k, v] of Object.entries(corsHeaders)) headers.set(k, v);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}

export function corsPreflight(): Response {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export function jsonResponse(data: unknown, status = 200): Response {
  return withCors(Response.json(data, { status, headers: { "Content-Type": "application/json" } }));
}

export function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message }, status);
}
