import { router } from '../trpc';
import { digiflazz } from './digiflazz';
import { Layanans } from './layanans';
import { mainRouter } from './main';
import { methods } from './method';

export const appRouter = router({
  main: mainRouter,
  digiflazz: digiflazz,
  methods: methods,
  layanans: Layanans,
});

export type AppRouter = typeof appRouter;
