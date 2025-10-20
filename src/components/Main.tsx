import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { openForTeam } from '../store/modalSlice';
import PlayerModal from '../components/PlayerModal';
import Scoreboard from './Scoreboard';
import { startMatch } from '../store/matchSlice';

export default function MainScreen() {
  const dispatch = useAppDispatch();
  const { teamA, teamB } = useAppSelector(s => s.playerModal);

  const inProgress = useAppSelector(s => s.match.inProgress);

  if (inProgress) {
    // матч уже начат — показываем табло
    return <Scoreboard />;
  }

  const canStart =
    teamA.length > 0 &&
    teamB.length > 0 &&
    teamA.length === teamB.length; // 1v1 или 2v2

  const handleStart = () => {
    dispatch(startMatch({ teamA, teamB }));
    // при желании можно «зафризить» составы в modalSlice или сбросить там состояние
  };

  return (
    <>
      <Card className="mb-3">
        <Card.Body>
          <Card.Title>Создать новый матч</Card.Title>
          <Container>
            <Row className="g-2">
              <Col>
                <Button variant="secondary" onClick={() => dispatch(openForTeam('A'))}>
                  Команда A
                </Button>
              </Col>
              <Col>
                <Button variant="secondary" onClick={() => dispatch(openForTeam('B'))}>
                  Команда B
                </Button>
              </Col>
            </Row>
            <Row className="g-2">
              <Col>
                <div className="mt-2 text-muted">
                  {teamA.length ? teamA.join(' — ') : 'Нет игроков'}
                </div>
              </Col>
              <Col>
                <div className="mt-2 text-muted">
                  {teamB.length ? teamB.join(' — ') : 'Нет игроков'}
                </div>
              </Col>
            </Row>

            {/* Кнопка «Начать матч» появляется, только когда составы валидны */}
            {canStart && (
              <Row className="mt-3">
                <Col>
                  <Button size="lg" variant="success" onClick={handleStart} className="w-100">
                    Начать матч
                  </Button>
                </Col>
              </Row>
            )}

          </Container>
        </Card.Body>
      </Card>

      <PlayerModal />
    </>
  );
}
