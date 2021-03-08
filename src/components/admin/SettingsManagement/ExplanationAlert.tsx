import { Row, Col, Alert } from 'react-bootstrap'

export default function SettingsExplanationAlert() {
  return (
    <Alert variant='secondary'>
      <Row as='dl'>
        <Col as='dt' sm={2}>Začátek týdne</Col>
        <Col as='dd' sm={10}>
          Označuje první den týdne po přelomu uzavření registrací. Např. pokud se do pátku
          registruje na jeden týden a počínaje sobotou na další, týden začíná sobotou.
        </Col>
      </Row>

      <Row as='dl'>
        <Col as='dt' sm={2}>Otevření registrace</Col>
        <Col as='dd' sm={10}>
          Tento počet týdnů se přičte k začátku aktuálního týdne (tedy pokud týden začíná
          sobotou, přičte se k poslední sobotě, příp. ke dnešnímu datu, pokud je sobota).
          Př.: Týden začíná sobotou, je úterý, nastavili jsme 1. Vezme se tedy minulá sobota,
          přičte se 1 týden a výsledné datum je první den, na který se lze registrovat.
        </Col>
      </Row>

      <Row as='dl'>
        <Col as='dt' sm={2}>Uzavření registrace</Col>
        <Col as='dd' sm={10}>
          Tento počet týdnů se přičte ke konci aktuálního týdne (tedy pokud týden začíná
          sobotou, přičte se k následujícímu pátku, příp. ke dnešnímu datu, pokud je pátek).
          Př.: Týden začíná sobotou, je úterý, nastavili jsme 2. Vezme se tedy tento pátek,
          přičtou se 2 týdny a výsledné datum je poslední den, na který se lze registrovat.
        </Col>
      </Row>

      <Row>
        <Col sm={12}>
          Pokud tedy nastavíme hodnoty &quot;sobota, 1, 1&quot;, efektivně to znamená, že do pátku se lze
          registrovat na přístí týden, od soboty na ten další.
        </Col>
      </Row>
    </Alert>
  )
}
