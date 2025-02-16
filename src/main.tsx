import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Home from './App.tsx';
import './globals.scss';

// const RiskRewardCalc = lazy(() => import('./pages/RiskRewardCalc.tsx'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Home />
  </StrictMode>
);

// const router = createHashRouter(
//   [
//     // {
//     //   path: '/*',
//     //   element: <Home />
//     // },
//     {
//       path: '/risk-reward-calc',
//       element: <RiskRewardCalc />
//     }
//   ]
//   // { basename: '/' }
// );

// createRoot(document.getElementById('root')!).render(
//   <StrictMode>
//     <Suspense
//       fallback={
//         <div className="flex-1 content-center text-center">
//           <div className="flex items-center justify-center gap-3 font-semibold">
//             Loading <Spinner className="h-5 w-5" />
//           </div>
//         </div>
//       }
//     >
//       <RouterProvider router={router} />
//     </Suspense>
//   </StrictMode>
// );
