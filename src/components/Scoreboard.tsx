// src/components/Scoreboard.tsx
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import ListGroup from 'react-bootstrap/ListGroup';
import Badge from 'react-bootstrap/Badge';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  endMatch,
  gameTo, undoGame,
  pointTB, undoPointTB,
  resetCurrentSet,
} from '../store/matchSlice';

export default function Scoreboard() {
  const dispatch = useAppDispatch();
  const {
    teamA, teamB,
    gamesA, gamesB,
    sets,
    tiebreakActive, tbA, tbB,
  } = useAppSelector(s => s.match);

  // Собираем массив сетов для отправки:
  const buildPayloadSets = () => {
    const result = [...sets]; // завершённые сеты уже есть в Redux

    // Если идёт тай-брейк — текущий сет это 6–6 + очки TB
    if (tiebreakActive) {
      result.push({
        a: 6,
        b: 6,
        tiebreak: true,
        tbA,
        tbB,
      });
    } else if (gamesA > 0 || gamesB > 0) {
      // Иначе, если есть незавершённый сет в геймах — добавим его как есть
      result.push({ a: gamesA, b: gamesB });
    }

    return result;
  };

  const handleEndMatch = () => {
    const tg = (window as any).Telegram?.WebApp;

    // собери payload из Redux
    const payload = {
      type: 'match_result',
      teamA,
      teamB,
      sets: buildPayloadSets(), // как мы делали ранее
    };

    if (!tg || !tg.sendData) {
      console.warn('Telegram WebApp API недоступен. Откройте приложение из бота.');
      alert('Откройте это приложение через кнопку в боте Telegram, иначе отправка не сработает.');
      return;
    }

    try {
      tg.sendData(JSON.stringify(payload)); // 1) отправка
      // tg.close(); // опционально: закрыть окно после отправки
    } catch (e) {
      console.error('Ошибка sendData', e);
      return; // не сбрасываем матч, если отправка не удалась
    }

    // 2) Сбрасываем матч ЧУТЬ ПОЗЖЕ, чтобы UI не исчезал мгновенно
    // (дать WebView шанс отправить данные)
    setTimeout(() => {
      dispatch(endMatch());
    }, 150); // 100–200 ms обычно достаточно
  };


  return (
    <Card>
      <Card.Body>
        <Card.Title>Текущий матч</Card.Title>

        <Container className="mb-3">
          <Row className="g-3 align-items-center">
            <Col>
              <div className="fw-semibold">Команда A</div>
              <div className="text-muted">{teamA.join(' — ')}</div>
            </Col>
            <Col>
              <div className="fw-semibold">Команда B</div>
              <div className="text-muted">{teamB.join(' — ')}</div>
            </Col>
          </Row>
        </Container>

        <Container className="mb-3">
            {sets.map((s, idx) => (
                <Row key={idx}>
                    <Col>{s.a} {s.tiebreak && typeof s.tbA === 'number' && typeof s.tbB === 'number'
                        ? ` (TB ${s.tbA})`
                        : ''}
                    </Col>
                    <Col>{s.b} {s.tiebreak && typeof s.tbA === 'number' && typeof s.tbB === 'number'
                        ? ` (TB ${s.tbB})`
                        : ''}
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
                  <div className="display-6">
                    {gamesA}
                  </div>
                  <Button className="w-100 mt-2" onClick={() => dispatch(gameTo('A'))}>
                    + гейм A
                  </Button>
                  <Button
                    className="w-100 mt-2"
                    variant="outline-secondary"
                    onClick={() => dispatch(undoGame('A'))}
                  >
                    - гейм A
                  </Button>
                </Col>
                <Col>
                  <div className="display-6">
                    {gamesB}
                  </div>
                  <Button className="w-100 mt-2" onClick={() => dispatch(gameTo('B'))}>
                    + гейм B
                  </Button>
                  <Button
                    className="w-100 mt-2"
                    variant="outline-secondary"
                    onClick={() => dispatch(undoGame('B'))}
                  >
                    - гейм B
                  </Button>
                </Col>
              </Row>
            </Container>
            <p className="text-muted">
              Сет завершается при разнице в 2 гейма.
              При 6–6 начинается тай-брейк.
            </p>
          </>
        ) : (
          <>
            <Container className="mb-2">
              <Row className="g-3 text-center">
                <Col>
                  <div className="display-6">
                    TB: {tbA}
                  </div>
                  <Button className="w-100 mt-2" onClick={() => dispatch(pointTB('A'))}>
                    + Очко TB A
                  </Button>
                  <Button
                    className="w-100 mt-2"
                    variant="outline-secondary"
                    onClick={() => dispatch(undoPointTB('A'))}
                  >
                    - Очко TB A
                  </Button>
                </Col>
                <Col>
                  <div className="display-6">
                    TB: {tbB}
                  </div>
                  <Button className="w-100 mt-2" onClick={() => dispatch(pointTB('B'))}>
                    + Очко TB B
                  </Button>
                  <Button
                    className="w-100 mt-2"
                    variant="outline-secondary"
                    onClick={() => dispatch(undoPointTB('B'))}
                  >
                    - Очко TB B
                  </Button>
                </Col>
              </Row>
            </Container>
            <p className="text-muted">
              Тай-брейк до 7, разница ≥2 (например: 7–5, 8–6).
              Победитель получает сет 7–6.
            </p>
          </>
        )}

        <Container>
          <Row className="g-2">
            <Col xs={12} md="auto">
              <Button variant="outline-danger" onClick={() => handleEndMatch()}>
                Завершить матч
              </Button>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
}
