import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { close, addPlayerToEditing, removePlayerFromEditing } from '../store/modalSlice';

const HARD_CODED_PLAYERS = [
  'Андрей',
  'Лера',
  'Настя',
  'Рома',
  'Саша',
];

export default function PlayerModal() {
  const dispatch = useAppDispatch();
  const { show, editingTeam, teamA, teamB } = useAppSelector(s => s.playerModal);

  const selected = editingTeam === 'A' ? teamA : teamB;
  const other    = editingTeam === 'A' ? teamB : teamA;
  const atLimit  = selected.length >= 2;

  const isDisabled = (name: string) =>
    (!selected.includes(name) && atLimit) || other.includes(name); // запрещаем 3-го и тех, кто в другой команде

  const handleToggle = (name: string) => {
    if (selected.includes(name)) dispatch(removePlayerFromEditing(name));
    else if (!isDisabled(name))  dispatch(addPlayerToEditing(name));
  };

  const handleClose = () => dispatch(close());
  const handleSave  = () => dispatch(close()); // состав уже сохранён в Redux по мере кликов

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {editingTeam ? `Команда ${editingTeam}` : 'Команда'}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form>
          {HARD_CODED_PLAYERS.map((player) => (
            <Form.Check
              key={player}
              type="checkbox"
              id={`player-${player}`}
              label={
                other.includes(player)
                  ? `${player} (в другой команде)`
                  : player
              }
              checked={selected.includes(player)}
              onChange={() => handleToggle(player)}
              disabled={isDisabled(player)}
              className="mb-2"
            />
          ))}
        </Form>
        <Form.Text muted>В каждой команде может быть 1–2 игрока. Игрок не может состоять в обеих командах.</Form.Text>
      </Modal.Body>
    </Modal>
  );
}
