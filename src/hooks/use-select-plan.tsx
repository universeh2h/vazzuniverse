'use client';
import { Product } from '@/types/digiflazz/ml';
import { create } from 'zustand';

export enum STEPORDER {
  plans = 1,
  wa = 2,
  payment = 3,
}
export type Method = {
  code: string;
  price: number;
  name: string;
};

export type TypePlansStore = {
  selectPlans: Product | null;
  setSelectPlans: (plans: Product | null) => void;
  noWa: null | string;
  setNowa: (wa: string) => void;
  selectPayment: null | Method;
  setSelectPayment: (method: Method) => void;
};

export const usePlansStore = create<TypePlansStore>((set) => ({
  selectPlans: null,
  setSelectPlans: (plans: Product | null) => set({ selectPlans: plans }),
  noWa: null,
  setNowa: (wa: string) => set({ noWa: wa }),
  selectPayment: null,
  setSelectPayment: (payment: Method) => set({ selectPayment: payment }),
}));
