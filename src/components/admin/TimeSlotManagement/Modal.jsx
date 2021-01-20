import React, { useState }               from 'react';
import { Button, Row, Col, Form, Modal } from 'react-bootstrap';
import DatePicker                        from 'react-datepicker';
import Select                            from 'react-select'

import { TimeSlot } from 'src/models';

export default function TimeSlotModal({ hide, timeSlot, availableExamTypes, submit }) {
  const [name, setName                        ] = useState(timeSlot.name);
  const [startTime, setStartTime              ] = useState(timeSlot.startTime);
  const [endTime, setEndTime                  ] = useState(timeSlot.endTime);
  const [limitCoefficient, setLimitCoefficient] = useState(timeSlot.limitCoefficient);
  const [examTypes, setExamTypes              ] = useState(timeSlot.examTypes);

  const FromInput = React.forwardRef(({ value, onClick }, ref) =>
    <>
      <Form.Control readOnly value={value} onClick={onClick} ref={ref} isInvalid={!startTime} />
      <Form.Control.Feedback type="invalid">
        Tato položka je povinná
      </Form.Control.Feedback>
    </>
  )

  const ToInput = React.forwardRef(({ value, onClick }, ref) =>
    <>
      <Form.Control readOnly value={value} onClick={onClick} ref={ref} isInvalid={!endTime} />
      <Form.Control.Feedback type="invalid">
        Tato položka je povinná
      </Form.Control.Feedback>
    </>
  )

  return (
    <Modal show={true} onHide={hide} id='time-slot-modal'>
      <Modal.Header closeButton>
        <Modal.Title>{timeSlot.id ? 'Editace' : 'Vytvoření'} časového slotu</Modal.Title>
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
          onClick={() => submit(
            new TimeSlot({ name, startTime, endTime, limitCoefficient, examTypes })
          )}
        >
          Uložit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
