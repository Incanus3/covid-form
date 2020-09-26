import React, { useState } from 'react';
import { Alert, Card, Form, Button } from 'react-bootstrap';
import DatePicker from 'react-datepicker';

export function CovidCard() {
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

export function CovidForm() {
  const [startDate, setStartDate] = useState(new Date());

  return (
    <Form id="covid-form">
      <Form.Group controlId="examination-type">
        <Form.Label>Jaký druh vyšetření požadujete?</Form.Label>
        <Form.Check
          type="radio"
          id="pcr"
          label="PCR vyšetření (výtěr z nosu a následné laboratorní zpracování)" />
        <Form.Check
          type="radio"
          id="rapid"
          label="RAPID test (orientační test z kapky krve)" />
      </Form.Group>

      <Form.Group controlId="requestor-type">
        <Form.Label>Kdo vyšetření požaduje?</Form.Label>
        <Form.Check
          type="radio"
          id="pl"
          label="PL / PLDD (odeslal mne můj ošetřující lékař)" />
        <Form.Check
          type="radio"
          id="khs"
          label="KHS (k vyšetření jsem indikován hygienikem)" />
        <Form.Check
          type="radio"
          id="samoplatce"
          label="SAMOPLÁTCE (vyšetření si hradím sám a požaduji jej pouze pro svou potřebu)" />
      </Form.Group>

      <Form.Group id="have-request-form">
        <Form.Check
          type="checkbox"
          label="Mám vystavenu elektronickou žádanku od mého PL/PLDD nebo z KHS" />
        <Form.Text className="text-muted">
          Bez této žádanky NENÍ další registrace možná, vyšetření nebude provedeno.
        </Form.Text>
      </Form.Group>

      <Form.Group controlId="examination-date">
        <Form.Label>Datum vyšetření</Form.Label>
        {/* <Form.Control type="text" placeholder="Vaše křestní jméno" /> */}
        <DatePicker inline selected={startDate} onChange={date => setStartDate(date)} monthsShown={2} />
      </Form.Group>

      <Form.Group controlId="first-name">
        <Form.Label>Jméno</Form.Label>
        <Form.Control type="text" placeholder="Vaše křestní jméno" />
      </Form.Group>

      <Form.Group controlId="last-name">
        <Form.Label>Příjmení</Form.Label>
        <Form.Control type="text" placeholder="Vaše příjmení" />
      </Form.Group>

      <Form.Group controlId="email">
        <Form.Label>E-mailová adresa</Form.Label>
        <Form.Control type="email" placeholder="Vaše e-mailová adresa" />
      </Form.Group>

      <Form.Group controlId="address">
        <Form.Label>Adresa bydliště (město, ulice, č.p.)</Form.Label>
        <Form.Control type="text" placeholder="Vaše adresa" />
      </Form.Group>

      <Form.Group controlId="zip">
        <Form.Label>PSČ</Form.Label>
        <Form.Control type="number" placeholder="Vaše poštovní směrovací číslo" />
      </Form.Group>

      <Form.Group controlId="phone">
        <Form.Label>Telefonní číslo</Form.Label>
        <Form.Control type="phone" placeholder="Vaše telefonní číslo" />
      </Form.Group>

      <Form.Group controlId="insurance-number">
        <Form.Label>Číslo pojištěnce (bez lomítka)</Form.Label>
        <Form.Control type="number" placeholder="Vaše číslo pojištěnce" />
      </Form.Group>

      <Form.Group controlId="insurance-company">
        <Form.Label>Zdravotní pojišťovna</Form.Label>
        <Form.Check
          type="radio"
          id="300"
          label="SAMOPLÁTCE" />
        <Form.Check
          type="radio"
          id="111"
          label="VZP" />
        <Form.Check
          type="radio"
          id="201"
          label="VOZP" />
        <Form.Check
          type="radio"
          id="205"
          label="ČPZP" />
        <Form.Check
          type="radio"
          id="207"
          label="OZP" />
        <Form.Check
          type="radio"
          id="209"
          label="ZPŠ" />
        <Form.Check
          type="radio"
          id="211"
          label="ZPMV" />
        <Form.Check
          type="radio"
          id="213"
          label="RBP" />
        <Form.Check
          type="radio"
          id="999"
          label="Cizinec bez zdravotní pojišťovny, indikovaný lékařem / KHS" />
      </Form.Group>

      <Button variant="primary" type="submit">
        Submit
      </Button>
    </Form>
  )
}
