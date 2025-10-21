// src/components/Scoreboard.tsx
import { useMemo, useState } from 'react';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { endMatch, gameTo, undoGame, pointTB, undoPointTB } from '../store/matchSlice';
import MatchSummary, { MatchPayload } from './MatchSummary';
import DebugPanel from './DebugPanel';
import { useTelegram } from '../hooks/useTelegram';

export default function Scoreboard() {
  const dispatch = useAppDispatch();
  const { teamA, teamB, gamesA, gamesB, sets, tiebreakActive, tbA, tbB } = useAppSelector(s => s.match);

  const { tg, available, user } = useTelegram();
  const [summary, setSummary] = useState<MatchPayload | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);

  const buildPayloadSets = () => {
    const result = [...sets];
    if (tiebreakActive) {
      result.push({ a: 6, b: 6, tiebreak: true, tbA, tbB });
    } else if (gamesA > 0 || gamesB > 0) {
      result.push({ a: gamesA, b: gamesB });
    }
    return result;
  };

  const handlePing = () => {
    if (!available || !tg?.sendData) {
      alert('Открой приложение через кнопку в боте Telegram.');
      return;
    }
    const payload = { type: 'ping', timestamp: Date.now(), message: 'Ping from frontend' };
    setLastPayload(payload);
    console.log('Sending ping:', payload);
    tg.showAlert?.('Ping отправлен ✅');
    tg.sendData(JSON.stringify(payload));
  };

  const resendLast = () => {
    if (!lastPayload) return;
    if (!available || !tg?.sendData) {
      alert('Открой приложение через кнопку в боте Telegram.');
      return;
    }
    tg.sendData(JSON.stringify(lastPayload));
    tg.showAlert?.('Повторная отправка выполнена ✅');
  };

  const handleEndMatch = () => {
    const payload: MatchPayload = { type: 'match_result', teamA, teamB, sets: buildPayloadSets() };
    setLastPayload(payload);

    if (!available || !tg?.sendData) {
      alert('Открой приложение через кнопку в боте Telegram.');
      return;
    }

    try {
      const json = JSON.stringify(payload);
      console.log('Sending to bot:', json);
      tg.sendData(json);
      tg.showAlert?.('Результат отправлен боту ✅');
    } catch (e) {
      console.error('Ошибка sendData', e);
      tg.showAlert?.('Не удалось отправить результат 😕');
      return;
    }

    setSummary(payload);
    // при желании можно закрыть после небольшой задержки:
    // setTimeout(() => tg?.close?.(), 250);
  };

  const startNewMatch = () => {
    setSummary(null);
    dispatch(endMatch());
  };

  if (summary) {
    return (
      <>
        <DebugPanel
          available={available}
          platform={tg?.platform}
          user={user}
          lastPayload={lastPayload}
          onPing={handlePing}
          onResend={resendLast}
        />
        <MatchSummary payload={summary} onNewMatch={startNewMatch} />
      </>
    );
  }

  return (
    <>
      <DebugPanel
        available={available}
        platform={tg?.platform}
        user={user}
        lastPayload={lastPayload}
        onPing={handlePing}
        onResend={resendLast}
      />

      {/* дальше твоя карточка, как была */}
      <Card>
        <Card.Body>
          <Card.Title>Текущий матч</Card.Title>

          <Container className="mb-3">
            <Row className="g-3 align-items-center">
              <Col><div className="text-muted">{teamA.join(' — ')}</div></Col>
              <Col><div className="text-muted">{teamB.join(' — ')}</div></Col>
            </Row>
          </Container>

          <Container className="mb-3">
            {sets.map((s, idx) => (
              <Row key={idx}>
                <Col>
                  <div className={`fs-3 ${s.a >= s.b ? 'fw-bold' : ''}`}>
                    {s.a}{s.tiebreak && typeof s.tbA === 'number' && typeof s.tbB === 'number' ? ` (TB ${s.tbA})` : ''}
                  </div>
                </Col>
                <Col>
                  <div className={`fs-3 ${s.b >= s.a ? 'fw-bold' : ''}`}>
                    {s.b}{s.tiebreak && typeof s.tbA === 'number' && typeof s.tbB === 'number' ? ` (TB ${s.tbB})` : ''}
                  </div>
                </Col>
              </Row>
            ))}
          </Container>

          {!tiebreakActive ? (
            <>
              <Container className="mb-2">
                <hr />
                <Row className="g-3 text-center">
                  <Col>
                    <div className="display-6">{gamesA}</div>
                    <Button className="w-100 mt-2" onClick={() => dispatch(gameTo('A'))}>+ гейм A</Button>
                    <Button className="w-100 mt-2" variant="outline-secondary" onClick={() => dispatch(undoGame('A'))}>- гейм A</Button>
                  </Col>
                  <Col>
                    <div className="display-6">{gamesB}</div>
                    <Button className="w-100 mt-2" onClick={() => dispatch(gameTo('B'))}>+ гейм B</Button>
                    <Button className="w-100 mt-2" variant="outline-secondary" onClick={() => dispatch(undoGame('B'))}>- гейм B</Button>
                  </Col>
                </Row>
              </Container>
              <p className="text-muted">Сет завершается при разнице в 2 гейма. При 6–6 начинается тай-брейк.</p>
            </>
          ) : (
            <>
              <Container className="mb-2">
                <Row className="g-3 text-center">
                  <Col>
                    <div className="display-6">TB: {tbA}</div>
                    <Button className="w-100 mt-2" onClick={() => dispatch(pointTB('A'))}>+ Очко TB A</Button>
                    <Button className="w-100 mt-2" variant="outline-secondary" onClick={() => dispatch(undoPointTB('A'))}>- Очко TB A</Button>
                  </Col>
                  <Col>
                    <div className="display-6">TB: {tbB}</div>
                    <Button className="w-100 mt-2" onClick={() => dispatch(pointTB('B'))}>+ Очко TB B</Button>
                    <Button className="w-100 mt-2" variant="outline-secondary" onClick={() => dispatch(undoPointTB('B'))}>- Очко TB B</Button>
                  </Col>
                </Row>
              </Container>
              <p className="text-muted">Тай-брейк до 7, разница ≥2 (например: 7–5, 8–6). Победитель получает сет 7–6.</p>
            </>
          )}

          <Container>
            <Row className="g-2">
              <Col xs={12} md="auto">
                <Button variant="outline-danger" onClick={handleEndMatch}>Завершить матч</Button>
              </Col>
            </Row>
          </Container>
        </Card.Body>
      </Card>
    </>
  );
}
