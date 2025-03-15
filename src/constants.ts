export const URL_LOGO = process.env.NEXT_PUBLIC_LOGO_URL as string;
export const DIGI_USERNAME = process.env.DIGI_USERNAME as string;
export const DIGI_KEY = process.env.DIGI_API_KEY as string;
export type TransactionMidtrans =
  | 'pending'
  | 'settlement'
  | 'capture'
  | 'deny'
  | 'expire'
  | 'cancel';
export const CATEGORIES_QUERY_KEY = ['categories'] as const;
export const DUITKU_MERCHANT_CODE = process.env.DUITKU_MERCHANT_CODE;
export const DUITKU_API_KEY = process.env.DUITKU_API_KEY;
export const DUITKU_BASE_URL =
  process.env.NODE_ENV === 'production'
    ? 'https://passport.duitku.com/webapi'
    : 'https://sandbox.duitku.com/webapi';
export const DUITKU_CALLBACK_URL = process.env.NEXT_PUBLIC_DUITKU_CALLBACK_URL;
export const DUITKU_RETURN_URL = process.env.NEXT_PUBLIC_DUITKU_RETURN_URL;
export const DUITKU_EXPIRY_PERIOD = 60 * 24;
