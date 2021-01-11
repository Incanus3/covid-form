import { saveAs                               } from 'file-saver';
import { capitalize                           } from 'lodash';
import React, { useState                      } from 'react';
import { Row, Col, Button, Alert, Form, Modal } from 'react-bootstrap';

import { request     } from 'src/backend';
import { formatDate  } from 'src/utils/generic';
import { AsyncResult } from 'src/utils/results';
import { DatePicker  } from 'src/utils/components';

async function saveExport(password, startDate, endDate) {
  if (typeof(password) === 'string') {
    const headers = {
      'Authorization': `Password ${password}`,
    }

    const response = await request('GET', '/export', {
      headers, params: { start_date: formatDate(startDate), end_date: formatDate(endDate) }
    })

    if (response.ok) {
      saveAs(await response.clone().blob(), 'export.csv');
    }

    return await AsyncResult.fromResponse(response);
  }
}

function ExportModal(props) {
  const { show, hide, startDate, setStartDate, endDate, setEndDate, setExportResult } = props;

  const [password, setPassword] = useState('');

  const ExportFromInput = React.forwardRef(({ value, onClick }, ref) =>
    <Form.Control readOnly value={value} onClick={onClick} ref={ref} />
  )

  const ExportToInput = React.forwardRef(({ value, onClick }, ref) =>
    <Form.Control readOnly value={value} onClick={onClick} ref={ref} />
  )

  const startDateChanged = (date) => {
    setStartDate(date);

    if (date > endDate) {
      setEndDate(date);
    }
  }

  const submit = async (password) => {
    setExportResult(await saveExport(password, startDate, endDate));
  }

  return (
    <Modal show={show} onHide={hide}>
      <Modal.Header closeButton>
        <Modal.Title>Exportovat do CSV</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Form noValidate id='export-csv-form'>
          <Form.Group id='export-from' as={Row}>
            <Form.Label column sm={6}>Zahrnout od data (včetně)</Form.Label>
            <Col sm={6}>
              <DatePicker
                selected={startDate}
                onChange={startDateChanged}
                minDate={new Date()}
                dateFormat='dd.MM.yyyy'
                customInput={<ExportFromInput />}
              />
            </Col>
          </Form.Group>

          <Form.Group id='export-to' as={Row}>
            <Form.Label column sm={6}>Zahrnout do data (včetně)</Form.Label>
            <Col sm={6}>
              <DatePicker
                selected={endDate}
                onChange={setEndDate}
                minDate={startDate}
                dateFormat='dd.MM.yyyy'
                customInput={<ExportToInput />}
              />
            </Col>
          </Form.Group>

          <Form.Group id='export-to' as={Row}>
            <Form.Label column sm={6}>Administrativní heslo</Form.Label>
            <Col sm={6}>
              <Form.Control
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') { submit(password); setPassword(''); hide() }
                }}
              />
            </Col>
          </Form.Group>

        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={() => { setPassword(''); hide() }}>
          Zrušit
        </Button>
        <Button variant="primary" onClick={() => { submit(password); setPassword(''); hide() }}>
          Exportovat
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default function Export() {
  const [showModal,    setShowModal   ] = useState(false);
  const [startDate,    setStartDate   ] = useState(new Date());
  const [endDate,      setEndDate     ] = useState(new Date());
  const [exportResult, setExportResult] = useState(null);

  return (
    <Row>
      <Col xs="auto">
        <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>Exportovat do CSV</Button>
      </Col>

      {exportResult?.isFailure &&
        <Col><Alert variant='danger'>{capitalize(exportResult.data.error)}</Alert></Col>
      }

      <ExportModal
        show={showModal}
        hide={() => setShowModal(false)}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        setExportResult={setExportResult}
      />
    </Row>
  );
}
