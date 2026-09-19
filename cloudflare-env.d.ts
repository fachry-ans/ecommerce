declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    INTEGRATION_MODE?: "mock" | "production";
    DOKU_BASE_URL?: string;
    DOKU_CLIENT_ID?: string;
    DOKU_SECRET_KEY?: string;
    DOKU_NOTIFICATION_TOKEN?: string;
    MABANG_BASE_URL?: string;
    MABANG_APP_KEY?: string;
    MABANG_APP_SECRET?: string;
    MABANG_ORDER_ENDPOINT?: string;
    MABANG_WEBHOOK_TOKEN?: string;
    STORE_PUBLIC_URL?: string;
  }
}
