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
  const [touchEvent, setTouchEvent] = useState<TouchEvent<T> | undefined>();

  useEffect(() => {
    const timerId = touchEvent
      ? setTimeout(() => onLongPress(touchEvent), delay)
      : undefined;
    return () => {
      clearTimeout(timerId);
    };
  }, [delay, onLongPress, touchEvent]);

  const onTouchEnd = useCallback(() => {
    setTouchEvent(undefined);
  }, []);

  const onTouchStart = useCallback((event: TouchEvent<T>) => {
    setTouchEvent(event);
  }, []);

  return { onTouchEnd, onTouchStart };
}
