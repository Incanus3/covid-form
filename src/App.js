import React from 'react';
import { Container, Row, Col  } from 'react-bootstrap';
import { CovidCard, CovidForm } from './CovidForm'

function App() {
  return (
    <Container>
      <Row>
        <Col>
          <CovidCard />
        </Col>
      </Row>

      <Row>
        <Col>
          <CovidForm />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
