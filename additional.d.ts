export {};

declare global {
  interface Window {
    __user: any;
  }

  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_BASE_URL: string;
      NEXT_PUBLIC_BASE_URL: string;
      NEXT_PUBLIC_SUPPORT_EMAIL: string;
      SMTP_FROM_EMAIL: string;
      PAYFAST_MERCHANT_ID: string;
      PAYFAST_MERCHANT_KEY: string;
      PAYFAST_PASSPHRASE: string;
      SMTP_USER: string;
      SMTP_PASSWORD: string;
      AUTH0_SECRET: string;
      AUTH0_BASE_URL: string;
      AUTH0_ISSUER_BASE_URL: string;
      AUTH0_CLIENT_ID: string;
      AUTH0_CLIENT_SECRET: string;
      MONGODB_URI: string;
    }
  }
}
