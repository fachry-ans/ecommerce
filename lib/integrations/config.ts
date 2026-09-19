import { env } from "cloudflare:workers";

export function integrationConfig() {
  const mode = env.INTEGRATION_MODE === "production" ? "production" : "mock";
  return {
    mode,
    storeUrl: env.STORE_PUBLIC_URL ?? "",
    doku: {
      baseUrl: env.DOKU_BASE_URL ?? "https://api-sandbox.doku.com",
      clientId: env.DOKU_CLIENT_ID ?? "",
      secretKey: env.DOKU_SECRET_KEY ?? "",
      notificationToken: env.DOKU_NOTIFICATION_TOKEN ?? "",
    },
    mabang: {
      baseUrl: env.MABANG_BASE_URL ?? "",
      appKey: env.MABANG_APP_KEY ?? "",
      appSecret: env.MABANG_APP_SECRET ?? "",
      orderEndpoint: env.MABANG_ORDER_ENDPOINT ?? "",
      webhookToken: env.MABANG_WEBHOOK_TOKEN ?? "",
    },
  };
}

export function integrationReadiness() {
  const config = integrationConfig();
  return {
    mode: config.mode,
    dokuReady: Boolean(config.doku.clientId && config.doku.secretKey),
    mabangReady: Boolean(config.mabang.baseUrl && config.mabang.appKey && config.mabang.appSecret && config.mabang.orderEndpoint),
    callbacksReady: Boolean(config.storeUrl && config.mabang.webhookToken),
  };
}
