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
          hod.</strong> a od 12.30 do 16.00 (odpolední termín pouze pro potvrzené registrace).
        </Card.Text>
        <Card.Text>
          E-maily s potvrzením termínu pro registraci nejsou rozesílány! Pacienti jsou k odběrům
          přijímáni pouze do naplnění kapacity odběrového místa. V případě naplněné kapacity můžete
          být, i přes registraci, předem kontaktován/a a může Vám být navržen jiný termín, nebo Vám
          nemusí být služba poskytnuta vůbec.
        </Card.Text>
        <Card.Text>
          Vyplněním a odesláním formuláře souhlasíte se zpracováním Vašich osobních údajů
          poskytovatelem zdravotní služby.
        </Card.Text>
      </Card.Body>
    </Card>
  )
}
