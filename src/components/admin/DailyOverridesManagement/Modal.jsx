import _ from 'lodash';

import React, { useState }               from 'react';
import { Alert, Button, Row, Col, Form, Modal } from 'react-bootstrap';
import DatePicker                        from 'react-datepicker';

import { DailyOverride } from 'src/models';

export default function DailyOverrideModal({ hide, entity, submit }) {
  const [error,             setError            ] = useState(null);
  const [date,              setDate             ] = useState(entity.date);
  const [registrationLimit, setRegistrationLimit] = useState(entity.registrationLimit);

  const disableSubmit = (
    !_.isDate(date) ||
    !_.isNumber(registrationLimit) || _.isNaN(registrationLimit) || registrationLimit < 0
  )

  const DateInput = React.forwardRef(({ value, onClick }, ref) =>
    <>
      <Form.Control readOnly value={value} onClick={onClick} ref={ref} isInvalid={!value} />
      <Form.Control.Feedback type="invalid">
        Tato položka je povinná
      </Form.Control.Feedback>
    </>
  )

  return (
    <Modal show={true} onHide={hide} id='daily-override-modal'>
      <Modal.Header closeButton>
        <Modal.Title>{entity.id ? 'Editace' : 'Vytvoření'} nastavení denní kapacity</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error && <Alert variant='danger'>{error}</Alert> || null}

        <Form noValidate id='daily-override-form'>
          <Form.Group id='daily-override-date' as={Row}>
            <Form.Label column sm={5}>Datum</Form.Label>
            <Col sm={7}>
              <DatePicker
                selected={date}
                onChange={setDate}
                dateFormat='PP'
                customInput={<DateInput />}
              />
            </Col>
          </Form.Group>

          <Form.Group id='daily-override-registration-limit' as={Row}>
            <Form.Label column sm={5}>Denní kapacita</Form.Label>
            <Col sm={7}>
              <Form.Control required
                type="number"
                value={registrationLimit}
                onChange={(e) => setRegistrationLimit(parseInt(e.target.value))}
                isInvalid={!_.isNumber(registrationLimit) || _.isNaN(registrationLimit) || registrationLimit < 0}
              />
              <Form.Control.Feedback type="invalid">
                Tato položka je povinná
              </Form.Control.Feedback>
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
          disabled={disableSubmit}
          onClick={async () => {
            (await submit(new DailyOverride({ date, registrationLimit })))
              .onFailure(async (data) => {
                setError(
                  `Nemohu ${_.isNil(entity.id) ? 'vytvořit' : 'upravit'} nastavení denní kapacity: ${data.error}.`
                );
              });
          }}
        >
          Uložit
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
