import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info';

export type ToastOptions = {
  type: ToastType;
  title?: string;
  message: string;
  durationMs?: number;
};

type Toast = ToastOptions & { id: string; leaving?: boolean };

type ToastApi = {
  success: (message: string, title?: string, durationMs?: number) => void;
  error: (message: string, title?: string, durationMs?: number) => void;
  info: (message: string, title?: string, durationMs?: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback(
    (opts: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const durationMs = opts.durationMs ?? 3200;
      const toast: Toast = { ...opts, id };

      setToasts(prev => [toast, ...prev].slice(0, 5));

      // Smooth exit: flip a "leaving" state shortly before removal.
      // (We store leaving as a lightweight property by mapping into state.)
      const outDurationMs = 250;
      const leavingDelayMs = Math.max(durationMs - outDurationMs, 0);

      window.setTimeout(() => {
        setToasts(prev =>
          prev.map(t => (t.id === id ? ({ ...t, leaving: true }) : t)),
        );
      }, leavingDelayMs);

      window.setTimeout(() => removeToast(id), durationMs);
    },
    [removeToast],
  );

  const api = useMemo<ToastApi>(
    () => ({
      success: (message, title, durationMs) => addToast({ type: 'success', title, message, durationMs }),
      error: (message, title, durationMs) => addToast({ type: 'error', title, message, durationMs }),
      info: (message, title, durationMs) => addToast({ type: 'info', title, message, durationMs }),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        style={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          zIndex: 100000,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          transform: 'translateX(-50%)',
          alignItems: 'center',
          pointerEvents: 'none',
        }}
      >
        {toasts.map(t => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'none',
              minWidth: 280,
              maxWidth: 440,
              padding: '12px 16px',
              borderRadius: 999,
              color: '#0f172a',
              boxShadow: '0 18px 45px rgba(15, 23, 42, 0.35)',
              border: '1px solid rgba(15,23,42,0.12)',
              transform: 'translateY(0)',
              opacity: 1,
              animation: t.leaving ? 'toast-out 0.25s ease-in forwards' : 'toast-in 0.25s ease-out forwards',
              background:
                t.type === 'success'
                  ? 'linear-gradient(135deg, #bbf7d0, #22c55e)'
                  : t.type === 'error'
                  ? 'linear-gradient(135deg, #fecaca, #ef4444)'
                  : 'linear-gradient(135deg, #bfdbfe, #3b82f6)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 8,
                alignSelf: 'stretch',
                borderRadius: 999,
                backgroundColor:
                  t.type === 'success' ? '#16a34a' : t.type === 'error' ? '#b91c1c' : '#1d4ed8',
              }}
            />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <div style={{ fontWeight: 800, fontSize: 13, letterSpacing: 0.4 }}>
                {t.title ?? (t.type === 'success' ? 'Success' : t.type === 'error' ? 'Error' : 'Info')}
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: 12.5, lineHeight: 1.45 }}>
                {t.message}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastApi => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
};

