import { useEffect, useMemo, useState } from 'react';
import { getTg, isInTelegram, getUserLabel, Tg } from '../telegram';

export function useTelegram() {
  const [tg, setTg] = useState<Tg | null>(null);
  const [available, setAvailable] = useState(false);
  const [user, setUser] = useState('—');

  useEffect(() => {
    const t = getTg();
    setTg(t);
    t?.ready?.();
    t?.MainButton?.hide?.();
    setAvailable(isInTelegram(t));
    setUser(getUserLabel(t));
  }, []);

  return useMemo(() => ({ tg, available, user }), [tg, available, user]);
}
