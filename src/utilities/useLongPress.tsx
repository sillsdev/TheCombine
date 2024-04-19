import {
  type TouchEvent,
  type TouchEventHandler,
  useCallback,
  useEffect,
  useState,
} from "react";

interface UseLongPressReturn<T> {
  onTouchEnd: TouchEventHandler<T>;
  onTouchStart: TouchEventHandler<T>;
}

// Inspired by https://stackoverflow.com/a/55880860/10210583
export default function useLongPress<T = Element>(
  onLongPress: (e: TouchEvent<T>) => void,
  delay = 1000
): UseLongPressReturn<T> {
  const [event, setEvent] = useState<TouchEvent<T> | undefined>();

  useEffect(() => {
    const timerId = event
      ? setTimeout(() => onLongPress(event), delay)
      : undefined;
    console.info(`timerId: ${timerId}`);
    return () => {
      clearTimeout(timerId);
    };
  }, [delay, event, onLongPress]);

  const onTouchStart = useCallback((e: TouchEvent<T>) => {
    setEvent(e);
  }, []);

  const onTouchEnd = useCallback(() => {
    setEvent(undefined);
  }, []);

  return { onTouchEnd, onTouchStart };
}
