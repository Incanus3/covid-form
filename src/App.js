import React from 'react';
import { Container, Row, Col  } from 'react-bootstrap';

import Export    from './Export'
import CovidCard from './CovidCard'
import CovidForm from './CovidForm'

function App() {
  return (
    <Container>
      <Export />

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
