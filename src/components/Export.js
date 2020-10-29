import { saveAs                               } from 'file-saver';
import { capitalize                           } from 'lodash';
import { useState                             } from 'react';
import { Row, Col, Button, Alert, Form, Modal } from 'react-bootstrap';

import { request                      } from '../backend';
import { Success, Failure, formatDate } from '../utils/generic';
import { DatePicker                   } from '../utils/components';

async function saveExport(password, startDate, endDate) {
  if (typeof(password) === 'string') {
    const headers = {
      'Authorization': `Password ${password}`,
    }

    const { status, body } = await request('GET', '/export', {
      headers, params: { start_date: formatDate(startDate), end_date: formatDate(endDate) }
    })

    if (status === 200) {
      saveAs(new Blob([body.csv], { type: 'text/csv;charset=utf-8' }), 'export.csv');

      return new Success();
    } else {
      return new Failure(body.error);
    }
  }
}

function ExportModal(props) {
  const { show, hide, startDate, setStartDate, endDate, setEndDate, setExportStatus } = props;

  const [password, setPassword] = useState('');

  const ExportFromInput = ({ value, onClick }) =>
    <Form.Control readOnly value={value} onClick={onClick} />

  const ExportToInput = ({ value, onClick }) =>
    <Form.Control readOnly value={value} onClick={onClick} />

  const startDateChanged = (date) => {
    setStartDate(date);

    if (date > endDate) {
      setEndDate(date);
    }
  }

  const submit = async (password) => {
    const result = await saveExport(password, startDate, endDate);

    setExportStatus(result);
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
  const [exportStatus, setExportStatus] = useState(null);

  return (
    <Row>
      <Col xs="auto">
        <Button variant="primary" size="lg" onClick={() => setShowModal(true)}>Exportovat do CSV</Button>
      </Col>

      {exportStatus && exportStatus.isFailure &&
        <Col><Alert variant='danger'>{capitalize(exportStatus.error)}</Alert></Col>
      }

      <ExportModal
        show={showModal}
        hide={() => setShowModal(false)}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        setExportStatus={setExportStatus}
      />
    </Row>
  );
}
