export function integrationConfig() {
  const mode = process.env.INTEGRATION_MODE === "production" ? "production" : "mock";
  return {
    mode,
    storeUrl: process.env.STORE_PUBLIC_URL ?? "",
    doku: {
      baseUrl: process.env.DOKU_BASE_URL ?? "https://api-sandbox.doku.com",
      clientId: process.env.DOKU_CLIENT_ID ?? "",
      secretKey: process.env.DOKU_SECRET_KEY ?? "",
      notificationToken: process.env.DOKU_NOTIFICATION_TOKEN ?? "",
    },
    mabang: {
      baseUrl: process.env.MABANG_BASE_URL ?? "",
      appKey: process.env.MABANG_APP_KEY ?? "",
      appSecret: process.env.MABANG_APP_SECRET ?? "",
      orderEndpoint: process.env.MABANG_ORDER_ENDPOINT ?? "",
      webhookToken: process.env.MABANG_WEBHOOK_TOKEN ?? "",
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
