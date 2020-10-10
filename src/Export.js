import React, { useState         } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import { capitalize              } from 'lodash';
import { saveAs                  } from 'file-saver';

import config               from './config'
import { Success, Failure } from './utils/generic'

async function saveExport() {
  const password = prompt('Zadejte administrátorské heslo');

  if (typeof(password) === 'string') {
    const headers = {
      'Authorization': `Password ${password}`,
      'Content-Type': 'application/json',
    }
    const response = await fetch(`${config.base_url}/export`, { headers: headers })
    const body     = await response.json()

    if (response.ok) {
      saveAs(new Blob([body.csv], { type: 'text/csv;charset=utf-8' }), 'export.csv');

      return new Success();
    } else {
      return new Failure(body.error);
    }
  }
}

export default function Export() {
  const [exportStatus, setExportStatus] = useState(null);

  const exportClicked = async () => {
    const result = await saveExport();

    setExportStatus(result);
  }

  return (
    <Row>
      <Col xs="auto">
        <Button variant="primary" size="lg" onClick={exportClicked}>Exportovat do CSV</Button>
      </Col>

      {exportStatus && exportStatus.isFailure &&
        <Col><Alert variant='danger'>{capitalize(exportStatus.error)}</Alert></Col>
      }
    </Row>
  );
}
