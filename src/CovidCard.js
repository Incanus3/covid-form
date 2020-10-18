import React from 'react';
import { Alert, Card } from 'react-bootstrap';

export default function CovidCard() {
  return (
    <Card>
      <Card.Header>Objednání k vyšetření na COVID 19</Card.Header>

      <Card.Body>
        <Card.Title>Prosíme, před vyplněním si přečtěte následující informace:</Card.Title>
        <Alert variant='danger'>Od 27.8.2020 až do odvolání je pozastaveno testování samoplátců!</Alert>
        <Card.Text>
          Provoz odběrového místa je zajištěn <strong>v pracovní dny v době od 8.00 do 12.00
          hod.</strong> a od 12.30 do 16.00 (odpolední termín pouze pro individuálně pozvané
          pacienty ze strany nemocnice).
        </Card.Text>
        <Card.Text>
          Prosíme, dostavte se v termínu, na který jste registrován/a.
        </Card.Text>
        <Card.Text>
          <strong>Upozornění:</strong> Pacienti jsou k odběrům přijímáni pouze do naplnění kapacity
          odběrového místa.
        </Card.Text>
        <Card.Text>
          Vyplněním a odesláním formuláře souhlasíte se zpracováním Vašich osobních údajů
          poskytovatelem zdravotní služby.
        </Card.Text>
      </Card.Body>
    </Card>
  )
}
