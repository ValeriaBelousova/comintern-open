import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';

type Props = {
  available: boolean;
  platform?: string;
  user: string;
  lastPayload?: any;
  onPing: () => void;
  onResend?: () => void;
};

export default function DebugPanel({ available, platform, user, lastPayload, onPing, onResend }: Props) {
  return (
    <Alert variant={available ? 'success' : 'warning'} className="mb-3">
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <div><strong>Telegram:</strong> {available ? 'обнаружен ✅' : 'нет ❌ (открыто вне Telegram)'}</div>
          <div><strong>Платформа:</strong> {platform ?? '—'}</div>
          <div><strong>Пользователь:</strong> {user}</div>
        </div>
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-secondary" onClick={onPing}>Ping</Button>
          {onResend && <Button size="sm" variant="outline-primary" onClick={onResend}>Повторить отправку</Button>}
        </div>
      </div>

      {lastPayload && (
        <pre className="mt-3 mb-0" style={{ maxHeight: 160, overflow: 'auto' }}>
{JSON.stringify(lastPayload, null, 2)}
        </pre>
      )}
    </Alert>
  );
}
