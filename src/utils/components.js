import React    from 'react';
import { Form } from 'react-bootstrap';

export function Radio(props) {
  return (
    <Form.Check
      type="radio"
      label={props.label}
      id={props.id}
      checked={props.groupValue === props.id}
      onChange={() => props.groupValueSetter(props.id)}
    />
  )
}

export function RadioGroup(props) {
  return (
    <Form.Group controlId={props.id}>
      <Form.Label>{props.label}</Form.Label>
      {props.options.map((option) =>
        <Radio
          label={option.label}
          id={option.id}
          key={option.id}
          groupValue={props.value}
          groupValueSetter={props.setter}
        />)}
    </Form.Group>
  )
}
