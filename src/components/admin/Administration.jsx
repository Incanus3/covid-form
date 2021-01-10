import * as _ from 'lodash';

import { useState, useContext                           } from 'react';
import { Container, Row, Col, Alert, Card, Form, Button } from 'react-bootstrap';
import { saveAs                                         } from 'file-saver';

import { AuthContext        } from 'src/auth'
import { Result, formatDate } from 'src/utils/generic';
import { DatePicker         } from 'src/utils/components';

async function saveExport(auth, startDate, endDate) {
  const response = await auth.authenticatedRequest('GET', '/admin/export', {
    params: { start_date: formatDate(startDate), end_date: formatDate(endDate) }
  })

  if (response.ok) {
    saveAs(await response.clone().blob(), 'export.csv');
  }

  return Result.fromResponse(response);
}

export default function Administration() {
  const auth = useContext(AuthContext)

  const [startDate,    setStartDate   ] = useState(new Date());
  const [endDate,      setEndDate     ] = useState(new Date());
  const [exportResult, setExportResult] = useState(null);

  const startDateChanged = (date) => {
    setStartDate(date);

    if (date > endDate) {
      setEndDate(date);
    }
  }

  const submit = async () => {
    setExportResult(await saveExport(auth, startDate, endDate));
  }

  const ExportFromInput = ({ value, onClick }) =>
    <Form.Control readOnly value={value} onClick={onClick} />

  const ExportToInput = ({ value, onClick }) =>
    <Form.Control readOnly value={value} onClick={onClick} />

  return (
    <Container>
      <Card id='csv-export-card'>
        <Card.Header>Export do CSV</Card.Header>

        <Card.Body>
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

            <Row>
              <Col xs="auto">
                <Button variant="primary" size="lg" onClick={submit}>
                  Exportovat
                </Button>
              </Col>

              {exportResult?.isFailure &&
                <Col><Alert variant='danger'>{_.capitalize(exportResult.data.error)}</Alert></Col>}
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  )
}
