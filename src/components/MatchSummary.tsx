// src/components/MatchSummary.tsx
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';

type SetDto = { a: number; b: number; tiebreak?: boolean; tbA?: number; tbB?: number };

export type MatchPayload = {
  type: 'match_result';
  teamA: string[];
  teamB: string[];
  sets: SetDto[];
};

export default function MatchSummary({
  payload,
  onNewMatch,
}: {
  payload: MatchPayload;
  onNewMatch: () => void;
}) {
  const { teamA, teamB, sets } = payload;

  return (
    <Card>
      <Card.Body>
        <Card.Title>Итоги матча</Card.Title>

        <Container className="mb-3">
          <Row className="g-3 align-items-center">
            <Col>
              <div className="text-muted">{teamA.join(' — ') || '—'}</div>
            </Col>
            <Col>
              <div className="text-muted">{teamB.join(' — ') || '—'}</div>
            </Col>
          </Row>
        </Container>

        <Container className="mb-3">
          {sets.length === 0 ? (
            <div className="text-muted">Сетов нет.</div>
          ) : (
            sets.map((s, idx) => (
              <Row key={idx}>
                <Col>
                  <div className={`fs-3 ${s.a >= s.b ? 'fw-bold' : ''}`}>
                    {s.a}
                    {s.tiebreak && typeof s.tbA === 'number' && typeof s.tbB === 'number'
                      ? ` (TB ${s.tbA})`
                      : ''}
                  </div>
                </Col>
                <Col>
                  <div className={`fs-3 ${s.b >= s.a ? 'fw-bold' : ''}`}>
                    {s.b}
                    {s.tiebreak && typeof s.tbA === 'number' && typeof s.tbB === 'number'
                      ? ` (TB ${s.tbB})`
                      : ''}
                  </div>
                </Col>
              </Row>
            ))
          )}
        </Container>

        <Container>
          <Row className="g-2">
            <Col xs={12} md="auto">
              <Button variant="primary" onClick={onNewMatch}>
                Новый матч
              </Button>
            </Col>
          </Row>
        </Container>
      </Card.Body>
    </Card>
  );
}
