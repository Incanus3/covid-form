import React, { useState         } from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import Dialog                      from 'react-bootstrap-dialog';
import { capitalize              } from 'lodash';
import { saveAs                  } from 'file-saver';

import config               from './config'
import { Success, Failure } from './utils/generic'

async function saveExport(password) {
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
  const [dialog,       setDialog      ] = useState(null);
  const [exportStatus, setExportStatus] = useState(null);

  const exportClicked = async () => {
    setExportStatus(null);

    dialog.show({
      title: 'Exportovat do CSV', body: 'Zadejte administrativní heslo:',
      actions: [
        Dialog.CancelAction(),
        Dialog.OKAction(async (dialog) => {
          const result = await saveExport(dialog.value);
          setExportStatus(result);
        })],
      prompt: Dialog.PasswordPrompt()
    });
  }

  return (
    <Row>
      <Col xs="auto">
        <Button variant="primary" size="lg" onClick={exportClicked}>Exportovat do CSV</Button>
      </Col>

      {exportStatus && exportStatus.isFailure &&
        <Col><Alert variant='danger'>{capitalize(exportStatus.error)}</Alert></Col>
      }

      <Dialog ref={(component) => setDialog(component)} />
    </Row>
  );
}
