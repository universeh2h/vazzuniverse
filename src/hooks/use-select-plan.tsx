'use client';

import { Category, PlansProps } from '@/types/category';
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
  type: string;
};

export type TypePlansStore = {
  selectPlans: PlansProps | null;
  userID: string | null;
  serverID: string | null;
  categories: Category | null;
  setCategories: (cat: Category | null) => void;
  setUserId: (userid: string | null) => void;
  setServerId: (serverId: string | null) => void;
  setSelectPlans: (plans: PlansProps | null) => void;
  noWa: null | string;
  setNowa: (wa: string) => void;
  selectPayment: null | Method;
  setSelectPayment: (method: Method) => void;
};

export const usePlansStore = create<TypePlansStore>((set) => ({
  selectPlans: null,
  userID: null,
  serverID: null,
  categories: null,
  setCategories: (cat: Category | null) => set({ categories: cat }),
  setUserId: (userid: string | null) => set({ userID: userid }),
  setServerId: (serverId: string | null) => set({ serverID: serverId }),
  setSelectPlans: (plans: PlansProps | null) => set({ selectPlans: plans }),
  noWa: null,
  setNowa: (wa: string) => set({ noWa: wa }),
  selectPayment: null,
  setSelectPayment: (payment: Method) => set({ selectPayment: payment }),
}));
