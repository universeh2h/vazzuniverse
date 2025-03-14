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
