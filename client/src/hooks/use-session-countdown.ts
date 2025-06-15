import { useEffect, useState } from 'react';

import { Session, SessionStatus } from '@/types/session';

interface UseSessionCountdownResult {
  remainingTTL: number;
  isSessionActive: boolean;
}

export const useSessionCountdown = (
  sessionData: Session | null,
  sessionLoading: boolean,
): UseSessionCountdownResult => {
  const [remainingTTL, setRemainingTTL] = useState(0);

  const isSessionActive =
    sessionData?.status === SessionStatus.START && remainingTTL > 0;

  useEffect(() => {
    if (
      !sessionLoading &&
      sessionData &&
      sessionData.status === SessionStatus.START
    ) {
      const initialTTL = sessionData.cameras[0]?.TTL || 0;
      setRemainingTTL(initialTTL);

      const timer = setInterval(() => {
        setRemainingTTL((prevTTL) => {
          if (prevTTL <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prevTTL - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    } else {
      setRemainingTTL(0);
    }
  }, [sessionData, sessionLoading]);

  return {
    remainingTTL,
    isSessionActive,
  };
};
