import { router } from '../trpc';
import { digiflazz } from './digiflazz';
import { Layanans } from './layanans';
import { mainRouter } from './main';
import { methods } from './method';
import { order } from './order';
import { subCategory } from './sub-category';
import { transaction } from './transaction';
import { voucher } from './voucher';

export const appRouter = router({
  main: mainRouter,
  digiflazz: digiflazz,
  methods: methods,
  layanans: Layanans,
  transaction,
  sub: subCategory,
  order: order,
  voucher: voucher,
});

export type AppRouter = typeof appRouter;
