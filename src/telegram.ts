export type Tg = {
  platform?: string;
  initDataUnsafe?: { user?: { id: number; username?: string; first_name?: string } };
  ready?: () => void;
  showAlert?: (msg: string) => void;
  MainButton?: { hide?: () => void };
  sendData?: (data: string) => void;
  close?: () => void;
};

export const getTg = (): Tg | null =>
  (window as any)?.Telegram?.WebApp ?? null;

export const isInTelegram = (tg: Tg | null): boolean =>
  !!tg && tg.platform !== 'unknown' && !!tg.initDataUnsafe?.user;

export const getUserLabel = (tg: Tg | null): string => {
  const u = tg?.initDataUnsafe?.user;
  if (!u) return '—';
  return u.username ? `@${u.username} (#${u.id})` : `${u.first_name ?? ''} (#${u.id})`;
};
