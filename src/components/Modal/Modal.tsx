import { cn } from "@/lib/classNames";
import { PropsWithChildren, useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { AnimateExpansion } from "../AnimateExpansion";
import { ClickAway } from "../ClickAway";
import { Spinner } from "../Spinner";

const DURATION = "duration-300";
const TIMING = parseInt(DURATION.split("-")[1]);

export function Modal({
  children,
  noPadding,
  busy,
  onClose,
}: PropsWithChildren<{
  noPadding?: boolean;
  busy?: boolean;
  onClose?: () => void;
}>) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 25);
    return () => clearTimeout(timeout);
  }, []);

  const handleClose = () => {
    if (!onClose) return;
    setShow(false);
    setTimeout(() => {
      onClose();
    }, TIMING);
  };

  return (
    <ModalPortal>
      <div
        className={cn(
          `${DURATION} fixed inset-0 z-50 content-center p-3 transition-all`,
          show
            ? "bg-black/50 backdrop-blur before:opacity-50"
            : "before:opacity-0"
        )}
      >
        <ClickAway
          className={cn(
            `relative mx-auto max-h-[min(100%,1024px)] min-h-12 w-fit min-w-40 overflow-auto rounded-lg bg-white text-slate-900 transition-all sm:max-w-[min(640px,90vw)] dark:bg-slate-800 dark:text-white ${DURATION} shadow-lg`,
            noPadding ? "" : "px-6 py-5",
            show ? "opacity-100" : "scale-0 opacity-0",
            busy ? "pointer-events-none select-none" : ""
          )}
          onClickOutside={busy ? undefined : handleClose}
        >
          {busy ? (
            <div className="absolute inset-0 z-10 content-center overflow-hidden bg-slate-50/75 opacity-100 duration-inherit dark:bg-slate-900/75">
              <Spinner className="mx-auto h-12 w-12 dark:text-slate-100" />
            </div>
          ) : undefined}
          <AnimateExpansion
            className="content-center"
            overrideHeight={show ? undefined : 0}
            inheritDuration
          >
            {children}
          </AnimateExpansion>
        </ClickAway>
      </div>
    </ModalPortal>
  );
}

Modal.Header = ({ children }: PropsWithChildren) => {
  return (
    <header className="mb-5 flex flex-row items-center justify-between gap-3">
      {children}
      <span className="inline-flex items-center justify-center rounded-md bg-indigo-500 p-2 shadow-lg">
        <svg
          className="h-6 w-6 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </span>
    </header>
  );
};

Modal.Title = ({ children }: PropsWithChildren) => (
  <h1 className="text-4xl font-extrabold">{children}</h1>
);

Modal.Subtitle = ({ children }: PropsWithChildren) => (
  <h1 className="text-4xl font-extrabold">{children}</h1>
);

Modal.Subheading = ({ children }: PropsWithChildren) => (
  <h3 className="text-2xl font-bold">{children}</h3>
);

Modal.Paragraph = ({ children }: PropsWithChildren) => {
  return (
    <p className="my-2 text-sm text-slate-600 dark:text-slate-400">
      {children}
    </p>
  );
};

Modal.Footer = ({ children }: PropsWithChildren) => {
  return (
    <footer className="mt-4 flex flex-row flex-wrap items-center gap-2 bg-inherit">
      {children}
    </footer>
  );
};

function ModalPortal({ children }: PropsWithChildren) {
  return ReactDOM.createPortal(children, document.body);
}
