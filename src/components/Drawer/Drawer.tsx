import { cn } from '@/lib/classNames';
import {
  createContext,
  PropsWithChildren,
  RefObject,
  useContext,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import ReactDOM from 'react-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { IoIosArrowForward } from 'react-icons/io';
import { Button } from '../Button';
import styles from './Drawer.module.scss';

export const TIMING = 300;

export interface ModalRef {
  close: () => Promise<void>;
}

export type ModalRefObject = RefObject<ModalRef>;

const initialDrawerContext = {
  close: () => new Promise<void>(resolve => setTimeout(resolve, TIMING))
};

const drawerContext = createContext(initialDrawerContext);

const useDrawerContext = () => useContext(drawerContext);

export function useModalRef() {
  const ref = useRef<ModalRef>(initialDrawerContext);
  return ref;
}

type FromPosition = 'top' | 'bottom' | 'left' | 'right';

const positionToClassname: Record<FromPosition, string> = {
  left: styles['from-left'],
  right: styles['from-right'],
  top: styles['from-top'],
  bottom: styles['from-bottom']
};

const mobilePositionToClassname: Record<FromPosition, string> = {
  left: styles['mobile-from-left'],
  right: styles['mobile-from-right'],
  top: styles['mobile-from-top'],
  bottom: styles['mobile-from-bottom']
};

export function Drawer({
  children,
  busy,
  onClosed,
  onRequestClose,
  from,
  mobileFrom,
  ref
}: PropsWithChildren<{
  busy?: boolean;
  onClosed?: () => void;
  onRequestClose?: () => void;
  position?: 'left' | 'right';
  from?: FromPosition;
  mobileFrom?: FromPosition;
  ref?: ModalRefObject;
}>) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setShow(true), 25);
    return () => clearTimeout(timeout);
  }, []);

  const handleClose = async () => {
    setShow(false);
    await new Promise<void>(resolve =>
      setTimeout(() => {
        resolve();
        if (show) onClosed?.();
      }, TIMING)
    );
  };

  useImperativeHandle(ref, () => ({ close: handleClose }), [handleClose]);

  const expansionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animateExpansion = expansionRef.current;
    if (!animateExpansion) return;

    return observeFirstChildOfLastElementResize(animateExpansion, ([entry]) => {
      if (!entry) return;
      animateExpansion.style.setProperty(
        '--content-height',
        `${entry.contentRect.height}px`
      );
    });
  }, [expansionRef]);

  return (
    <drawerContext.Provider
      value={{
        close: async () => {
          onRequestClose?.();
          await handleClose();
        }
      }}
    >
      <DrawerPortal>
        <div
          onClick={
            busy
              ? undefined
              : () => {
                  if (show) onRequestClose?.();
                  handleClose();
                }
          }
          className={cn(
            'no-body-scroll',
            styles.drawerContainer,
            show && styles.showDrawer
          )}
        >
          <div
            className={cn(
              styles.card,
              'bg-white text-black shadow-xl dark:bg-slate-800 dark:text-white',
              positionToClassname[from ?? 'left'],
              mobilePositionToClassname[mobileFrom ?? from ?? 'bottom']
            )}
            onClick={event => event.stopPropagation()}
          >
            {/* <AnimateExpansion> */}
            <div className={styles.animateExpansion} ref={expansionRef}>
              {/* <div className={styles.cardExpansionsWrapper}> */}
              {children}
              {/* </div> */}
            </div>
            {/* </AnimateExpansion> */}
          </div>
        </div>
      </DrawerPortal>
    </drawerContext.Provider>
  );
}

Drawer.Content = ({
  children,
  onClose
}: PropsWithChildren<{ onClose?: () => void }>) => {
  const [show, setShow] = useState(true);

  return (
    <div className={cn(styles.scroller, show && styles.showContent)}>
      <div>
        <div className={styles.cardContent}>
          {onClose ? (
            <Button
              empty
              onClick={() => {
                if (!onClose) return;
                setShow(false);
                setTimeout(onClose, TIMING);
              }}
              className="mb-4"
            >
              <FaArrowLeft /> Go back
            </Button>
          ) : undefined}
          {children}
        </div>
      </div>
    </div>
  );
};

Drawer.CloseOnClick = ({
  children,
  onClick
}: PropsWithChildren<{
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}>) => {
  const context = useDrawerContext();
  return (
    <div
      onClick={event => {
        context.close();
        onClick?.(event);
      }}
    >
      {children}
    </div>
  );
};

Drawer.Button = ({
  children,
  className,
  onClick,
  href,
  showNav
}: PropsWithChildren<{
  className?: string;
  onClick?: () => any;
  href?: string;
  showNav?: boolean;
}>) => {
  return (
    <Button
      className={cn('my-2 w-full font-bold', className)}
      empty
      size="lg"
      onClick={onClick}
      href={href}
    >
      {children}
      {showNav ? (
        <span className="h-5 w-5 rounded-full p-0.5">
          <IoIosArrowForward />
        </span>
      ) : undefined}
    </Button>
  );
};

function DrawerPortal({ children }: PropsWithChildren) {
  if (typeof window === 'undefined') {
    return null;
  }

  return ReactDOM.createPortal(children, document.body);
}

type Unsubscribe = () => void;

/**
 * Observes the size of the first child of the last element in a container.
 * If the last element changes or its first child changes, the observer is updated.
 *
 * @param container - The parent container element.
 * @param callback - The ResizeObserver callback invoked when the target's size changes.
 * @returns An object with a disconnect() method to clean up the observers.
 */
export function observeFirstChildOfLastElementResize(
  container: HTMLElement,
  callback: ResizeObserverCallback
): Unsubscribe {
  // Helper function: get the first child of the last element, or null if not available.
  const getTarget = (): HTMLElement | null => {
    const lastElement = container.lastElementChild as HTMLElement | null;
    if (lastElement && lastElement.firstElementChild) {
      return lastElement.firstElementChild as HTMLElement;
    }
    return null;
  };

  let target: HTMLElement | null = getTarget();

  const resizeObserver = new ResizeObserver(callback);
  if (target) {
    resizeObserver.observe(target);
  }

  const mutationObserver = new MutationObserver(() => {
    const newTarget = getTarget();
    if (newTarget !== target) {
      if (target) {
        resizeObserver.unobserve(target);
      }
      target = newTarget;
      if (target) {
        resizeObserver.observe(target);
      }
    }
  });

  // Watch for child list changes in the container
  mutationObserver.observe(container, { childList: true, subtree: true });

  return () => {
    mutationObserver.disconnect();
    resizeObserver.disconnect();
  };
}
