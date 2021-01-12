import * as _ from 'lodash';

import React, { useState, useContext                    } from 'react';
import { withRouter                                     } from 'react-router';
import { Container, Row, Col, Alert, Card, Form, Button } from 'react-bootstrap';
import { saveAs                                         } from 'file-saver';

import { AuthContext } from 'src/auth'
import { formatDate  } from 'src/utils/generic';
import { AsyncResult } from 'src/utils/results';
import { DatePicker  } from 'src/utils/components';

async function saveExport(auth, history, callback, startDate, endDate) {
  (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
    'GET', '/admin/export', {
      params: { start_date: formatDate(startDate), end_date: formatDate(endDate) }
    }
  )).onSuccess(async (response) => {
    if (response.ok) {
      saveAs(await response.clone().blob(), 'export.csv');
    }

    callback(await AsyncResult.fromResponse(response));
  })
}

function Export({ history }) {
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
    await saveExport(auth, history, setExportResult, startDate, endDate);
  }

  const ExportFromInput = React.forwardRef(({ value, onClick }, ref) =>
    <Form.Control readOnly value={value} onClick={onClick} ref={ref} />
  )

  const ExportToInput = React.forwardRef(({ value, onClick }, ref) =>
    <Form.Control readOnly value={value} onClick={onClick} ref={ref} />
  )

  return (
    <Container>
      <Card id='csv-export-card'>
        <Card.Header>Export do CSV</Card.Header>

        <Card.Body>
          <Form noValidate id='csv-export-form'>
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
                <Button id="csv-export-button" variant="primary" size="lg" onClick={submit}>
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

export default withRouter(Export);