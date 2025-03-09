import { router } from '../trpc';
import { digiflazz } from './digiflazz';
import { mainRouter } from './main';
import { methods } from './method';

export const appRouter = router({
  main: mainRouter,
  digiflazz: digiflazz,
  methods: methods,
});

export type AppRouter = typeof appRouter;
