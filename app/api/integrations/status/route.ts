import { integrationReadiness } from "../../../../lib/integrations/config";

export async function GET() {
  return Response.json(integrationReadiness(), { headers: { "Cache-Control": "no-store" } });
}
