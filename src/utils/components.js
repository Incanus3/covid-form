import 'element-closest';
import React, { useState, useEffect } from 'react';
import { Form }                       from 'react-bootstrap';
import DatePicker                     from 'react-datepicker';

export function Radio(props) {
  return (
    <Form.Check
      type="radio"
      label={props.label}
      id={props.id}
      checked={props.value === props.id}
      onChange={() => props.onChange(props.id)}
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
          value={props.value}
          onChange={props.setter}
        />)}
    </Form.Group>
  )
}

const MONTH_CONTAINER_CLASS    = "react-datepicker__month-container";
const MAX_EXPECTED_COL_PADDING = 50;

export function ResponsiveDatePicker(props) {
  if (!props.id) {
    throw new Error("ResponsiveDatePicker must have a unique id");
  }

  useWindowSize();

  var [monthsShown, setMonthsShown] = useState(1);

  var containerElement = document.getElementById(props.id);

  if (containerElement) {
    var monthContainerElement   = containerElement.getElementsByClassName(MONTH_CONTAINER_CLASS)[0];
    var containingColumnElement = containerElement.closest(".col");

    var monthsToShow = Math.max(1, Math.floor(
      (containingColumnElement.clientWidth - MAX_EXPECTED_COL_PADDING)
      / monthContainerElement.clientWidth
    ));

    if (monthsToShow !== monthsShown) {
      setMonthsShown(monthsToShow);
    }
  }

  return (
    <div id={props.id}>
      <DatePicker {...props} monthsShown={monthsShown} />
    </div>
  );
}

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width:  undefined,
    height: undefined,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener("resize", handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}
