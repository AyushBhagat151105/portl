import { createRootRoute, createRoute } from '@tanstack/react-router';
import { RootComponent } from './routes/__root';
import { IndexComponent } from './routes/index';

// 1. Root Route
export const rootRoute = createRootRoute({
  component: RootComponent,
});

// 2. Index Route
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexComponent,
});

// 3. Complete Route Tree
export const routeTree = rootRoute.addChildren([indexRoute]);
