import { useState, useContext           } from 'react';
import { Container, Alert, Form, Button } from 'react-bootstrap';
import { Redirect                       } from 'react-router-dom';

import { AuthContext } from 'src/auth'

export default function Login() {
  const auth = useContext(AuthContext)

  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [isLoggedIn,    setIsLoggedIn]    = useState(auth.isLoggedIn);
  const [attemptFailed, setAttemptFailed] = useState(false);

  const submit = async () => {
    if (await auth.logIn(email, password)) {
      setIsLoggedIn(true);
    } else {
      setAttemptFailed(true);
    }
  }

  if (isLoggedIn) {
    return <Redirect to="/admin/export" />
  } else {
    return (
      <Container>
        <Form noValidate id="covid-form">
          {attemptFailed && <Alert variant='danger'>Přihlášení selhalo</Alert>}

          <Form.Group controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control required autoFocus
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!email}
            />
            <Form.Control.Feedback type="invalid">
              Tato položka je povinná
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="password">
            <Form.Label>Heslo</Form.Label>
            <Form.Control required
              type="password"
              placeholder="Heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => (e.key === 'Enter') && submit() }
            />
          </Form.Group>

          <Button variant='primary' size="lg" onClick={submit}>Přihlásit se</Button>
        </Form>
      </Container>
    );
  }
}
