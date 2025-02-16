import { PropsWithChildren } from 'react';
import { Button } from './components/Button';
import './globals.scss';
import { useSearchParam } from './hooks/useSearchParam';
import FibPositionSizing from './pages/FibPositionSizing';
import PositionSizing from './pages/PositionSizing';

function Main({ children }: PropsWithChildren) {
  return (
    <main className="flex items-center justify-center bg-gradient-to-br from-red-100 to-sky-200 dark:bg-gradient-to-tl dark:from-gray-950 dark:to-gray-900">
      <div className="m-2 flex w-dvw min-w-32 max-w-[95vw] flex-col gap-5 overflow-hidden rounded-2xl bg-white px-6 py-5 text-center sm:w-fit sm:rounded-lg dark:bg-slate-800 dark:text-white">
        <div className="flex w-full flex-col items-start justify-between gap-6">
          {children}
        </div>
      </div>
    </main>
  );
}

function Nav() {
  const tool = useSearchParam<undefined | string>('t', undefined)[0];

  switch (tool) {
    case 'ps':
      return <PositionSizing />;
    case 'fib':
      return <FibPositionSizing />;
    default:
      return (
        <div className="flex max-w-screen-md flex-row flex-wrap gap-4">
          <Button href={`?t=ps`} filled>
            Position sizing {'>'}
          </Button>
          <Button href={`?t=fib`} filled>
            Fib position sizing {'>'}
          </Button>
        </div>
      );
  }
}

export default function Home() {
  return (
    <Main>
      <Nav />
    </Main>
  );
}
