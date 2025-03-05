import { Decimal } from "@prisma/client/runtime/library";

export type User = {
  id: string; // Keep as number to match Prisma Int
  name: string | null;
  username: string;
  role: string;
  password: string;
  whatsapp: string;
  balance:  Decimal;
  apiKey: string | null;
  otp: string  | null
  createdAt: Date;
  updatedAt: Date;
};