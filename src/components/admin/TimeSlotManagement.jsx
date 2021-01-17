import _ from 'lodash';

import React, { useState, useEffect, useContext                } from 'react';
import { withRouter                                            } from 'react-router';
import { Button, Container, Row, Col, Card, Form, Modal, Table } from 'react-bootstrap';
import { BsPencilSquare                                        } from 'react-icons/bs';
import DatePicker                                                from 'react-datepicker';
import Select                                                    from 'react-select'

import { AuthContext        } from 'src/auth';
import { ExamType, TimeSlot } from 'src/models';
import { WithTooltip        } from 'src/utils/components';

function TimeSlotRow({ timeSlot, coefficientMultiplier, edit }) {
  const slotCapacity = _.round(coefficientMultiplier * timeSlot.limitCoefficient);
  const examTypes    = _.join(_.map(timeSlot.examTypes, 'id'), ', ');

  return (
    <tr>
      <td>{timeSlot.name              }</td>
      <td>{timeSlot.formattedStartTime}</td>
      <td>{timeSlot.formattedEndTime  }</td>
      <td>{timeSlot.limitCoefficient  }</td>
      <td>{slotCapacity               }</td>
      <td>{examTypes                  }</td>
      <td>
        <WithTooltip text='editovat'><BsPencilSquare onClick={() => edit(timeSlot)} /></WithTooltip>
      </td>
    </tr>
  )
}

function TimeSlotTable({ timeSlots, dailyRegistrationLimit, edit }) {
  const coefficientSum        = _.sum(_.map(timeSlots, 'limitCoefficient'));
  const coefficientMultiplier = dailyRegistrationLimit / coefficientSum;

  return (
    <Table responsive size='sm' id='time-slot-table'>
      <thead>
        <tr>
          <th>Název                  </th>
          <th>Od                     </th>
          <th>Do                     </th>
          <th>Koeficient kapacity    </th>
          <th>Vypočtená kapacita     </th>
          <th>Povolené typy vyšetření</th>
          <th>Akce                   </th>
        </tr>
      </thead>

      <tbody>
        {timeSlots.map((timeSlot) =>
          <TimeSlotRow
            key={timeSlot.id}
            edit={edit}
            timeSlot={timeSlot}
            coefficientMultiplier={coefficientMultiplier}
          />
        )}
      </tbody>
    </Table>
  )
}

function TimeSlotManagement({ history }) {
  const auth = useContext(AuthContext)

  const [settings,  setSettings ] = useState(null);
  const [examTypes, setExamTypes] = useState(null);
  const [timeSlots, setTimeSlots] = useState(null);
  const [editedId,  setEditedId ] = useState(null);

  async function loadData(path, options, successHandler) {
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history, 'GET', path, options))
      .onSuccess(async (response) => response.ok && successHandler(await response.json()))
  }

  async function updateTimeSlot(id, values) {
    const data = values.toJSON();

    data.exam_types = _.map(data.exam_types, 'id');

    // TODO: show success or error message
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
      'PUT', `/admin/crud/time_slots/${id}`, { data }
    )).onSuccess(async (response) => response.ok && console.log(await response.json()))
  }

  const loadSettings  = async () => loadData('/admin/settings', {},
    (data) => setSettings(data.settings))
  const loadExamTypes = async () => loadData('/admin/crud/exam_types', {},
    (data) => setExamTypes(data.exam_types.map((etJSON) => ExamType.fromJSON(etJSON))))
  const loadTimeSlots = async () => loadData('/admin/crud/time_slots',
    { params: { 'with[]': 'exam_types' } },
    (data) => setTimeSlots(data.time_slots.map((tsJSON) => TimeSlot.fromJSON(tsJSON))))

  async function submit(updatedTimeSlot) {
    await updateTimeSlot(editedId, updatedTimeSlot);

    setEditedId(null);

    loadTimeSlots();
  }

  useEffect(() => {
    loadSettings();
    loadExamTypes();
    loadTimeSlots();
    // eslint-disable-next-line
  }, [])

  return (
    <Container>
      <Card id='time-slot-management-card'>
        <Card.Header>Nastavení časových slotů</Card.Header>

        <Card.Body>
          {settings && timeSlots &&
            <TimeSlotTable
              edit={(timeSlot) => setEditedId(timeSlot.id)}
              timeSlots={timeSlots}
              dailyRegistrationLimit={settings.daily_registration_limit}
            />}
        </Card.Body>
      </Card>

      {editedId && <TimeSlotModal
        show={true}
        hide={() => setEditedId(null)}
        submit={submit}
        timeSlot={_.find(timeSlots, { id: editedId })}
        availableExamTypes={examTypes}
      />}
    </Container>
  )
}

function TimeSlotModal({ show, hide, timeSlot, availableExamTypes, submit }) {
  const [name, setName                        ] = useState(timeSlot.name);
  const [startTime, setStartTime              ] = useState(timeSlot.startTime);
  const [endTime, setEndTime                  ] = useState(timeSlot.endTime);
  const [limitCoefficient, setLimitCoefficient] = useState(timeSlot.limitCoefficient);
  const [examTypes, setExamTypes              ] = useState(timeSlot.examTypes);

  const FromInput = React.forwardRef(({ value, onClick }, ref) =>
    <Form.Control readOnly value={value} onClick={onClick} ref={ref} />
  )

  const ToInput = React.forwardRef(({ value, onClick }, ref) =>
    <Form.Control readOnly value={value} onClick={onClick} ref={ref} />
  )

  return (
    <Modal show={show} onHide={hide} id='time-slot-modal'>
      <Modal.Header closeButton>
        <Modal.Title>Editace časového slotu</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form noValidate id='time-slot-form'>
          <Form.Group id='time-slot-name' as={Row}>
            <Form.Label column sm={5}>Název</Form.Label>
            <Col sm={7}>
              <Form.Control required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                isInvalid={!name}
              />
              <Form.Control.Feedback type="invalid">
                Tato položka je povinná
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group id='time-slot-start-time' as={Row}>
            <Form.Label column sm={5}>Od</Form.Label>
            <Col sm={7}>
              <DatePicker
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption='Čas počátku'
                dateFormat='HH:mm'
                selected={startTime}
                onChange={setStartTime}
                customInput={<FromInput />}
              />
            </Col>
          </Form.Group>

          <Form.Group id='time-slot-end-time' as={Row}>
            <Form.Label column sm={5}>Do</Form.Label>
            <Col sm={7}>
              <DatePicker
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption='Čas konce'
                dateFormat='HH:mm'
                selected={endTime}
                onChange={setEndTime}
                customInput={<ToInput />}
              />
            </Col>
          </Form.Group>

          <Form.Group id='time-slot-limit-coefficient' as={Row}>
            <Form.Label column sm={5}>Koeficient kapacity</Form.Label>
            <Col sm={7}>
              <Form.Control required
                type="number"
                value={limitCoefficient}
                onChange={(e) => setLimitCoefficient(parseInt(e.target.value))}
                isInvalid={!limitCoefficient}
              />
              <Form.Control.Feedback type="invalid">
                Tato položka je povinná
              </Form.Control.Feedback>
            </Col>
          </Form.Group>

          <Form.Group id='time-slot-exam-types' as={Row}>
            <Form.Label column sm={5}>Typy testů</Form.Label>
            <Col sm={7}>
              <Select
                options={availableExamTypes}
                value={examTypes}
                onChange={(values) => setExamTypes(values || [])}
                getOptionValue={(examType) => examType.id}
                getOptionLabel={(examType) => examType.description}
                isMulti={true}
                isSearchable={false}
                closeMenuOnSelect={false}
                hideSelectedOptions={true}
                placeholder='Vyberte hodnoty...'
              />
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={hide}>
          Zrušit
        </Button>
        <Button
          variant="primary"
          onClick={() => submit(new TimeSlot({ name, startTime, endTime, limitCoefficient, examTypes }))}
        >
          Uložit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default withRouter(TimeSlotManagement);
