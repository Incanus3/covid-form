import { Alert, Form                                } from 'react-bootstrap';
import { isWeekend, isMonday, isWednesday, isFriday } from 'date-fns';

import config                               from 'src/config'
import { RadioGroup, ResponsiveDatePicker } from 'src/utils/components';

import { APP_TYPE_COVID_TEST } from 'src/constants';
import {
  REQUESTOR_TYPE_AG, REQUESTOR_TYPE_PL, REQUESTOR_TYPE_KHS, REQUESTOR_TYPE_SAMOPL,
  INSURANCE_COMPANY_KHS, INSURANCE_COMPANY_VZP, INSURANCE_COMPANY_VOZP, INSURANCE_COMPANY_CPZP,
  INSURANCE_COMPANY_OZP, INSURANCE_COMPANY_ZPS, INSURANCE_COMPANY_ZPMV, INSURANCE_COMPANY_RBP,
  INSURANCE_COMPANY_SAMOPL
} from './constants';

let procedureName;

if (config.app_type === APP_TYPE_COVID_TEST) {
  procedureName = 'vyšetření';
} else {
  procedureName = 'očkování';
}

export function ExamTypeSelection({ options, value, setValue, disabledValues, loading }) {
  const label = `Jaký druh ${procedureName} požadujete?`;
  const id = 'examination-type';

  if (loading || options.lenth === 0) {
    let alertVariant, alertText;

    if (loading) {
      alertVariant = 'info';
      alertText    = `Načítám druhy ${procedureName}`;
    } else {
      alertVariant = 'danger';
      alertText    = `Nebyly nalezeny žádné druhy ${procedureName}.`;
    }

    return (
      <Form.Group controlId={id}>
        <Form.Label>{label}</Form.Label>
        <Alert variant={alertVariant}>{alertText}</Alert>
      </Form.Group>
    )
  } else {
    return (
      <RadioGroup
        id={id}
        label={label}
        value={value}
        setter={setValue}
        disabledIds={disabledValues}
        options={options.map(examType => ({ id: examType.id, label: examType.description }))}
      />
    )
  }
}

export function ExamTimeSelection({ options, value, setValue, loading }) {
  const id    = 'examination-time'
  const label = `Čas ${procedureName}`

  if (loading || options.length === 0) {
    let alertVariant, alertText;

    if (loading) {
      alertVariant = 'info';
      alertText    = 'Načítám časové sloty';
    } else {
      alertVariant = 'danger';
      alertText    = `Pro zvolený druh ${procedureName} nebyly nalezeny žádné časové sloty.`;
    }

    return (
      <Form.Group controlId={id}>
        <Form.Label>{label}</Form.Label>
        <Alert variant={alertVariant}>{alertText}</Alert>
      </Form.Group>
    )
  } else {
    return (
      <RadioGroup
        id={id}
        label={label}
        value={value}
        setter={setValue}
        options={options.map(slot => ({ id: slot.id, label: slot.time_range }))}
      />
    )
  }
}

export function ExamDateSelection({ value, setValue, minDate, maxDate, disabledDates }) {
  let dateFilter;

  if (config.app_type === APP_TYPE_COVID_TEST) {
    dateFilter = (date) => !isWeekend(date)
  } else {
    dateFilter = (date) => isMonday(date) || isWednesday(date) || isFriday(date)
  }

  return (
    <Form.Group controlId="examination-date">
      <Form.Label>Datum {procedureName}</Form.Label>
      <ResponsiveDatePicker inline disabledKeyboardNavigation
        id='examination-date'
        selected={value}
        onChange={date => setValue(date)}
        minDate={minDate}
        maxDate={maxDate}
        excludeDates={disabledDates}
        filterDate={dateFilter}
      />
    </Form.Group>
  )
}

export function RequestorTypeSelection({ value, setValue }) {
  let label, options;

  if (config.app_type === APP_TYPE_COVID_TEST) {
    label = 'Kdo vyšetření požaduje?'
    options = [
      { id: REQUESTOR_TYPE_PL,
        label: 'PL / PLDD (odeslal mne můj ošetřující lékař)' },
      { id: REQUESTOR_TYPE_KHS,
        label: 'KHS (k vyšetření jsem indikován hygienikem)' },
      { id: REQUESTOR_TYPE_SAMOPL,
        label: 'Samoplátce (vyšetření si hradím sám a požaduji jej pouze pro svou potřebu)' },
      { id: REQUESTOR_TYPE_AG,
        label: 'Veřejnost (dobrovolné bezplatné testování)' },
    ]
  } else {
    label = 'Komu je očkování určeno?'
    options = [
      { id: REQUESTOR_TYPE_PL,
        label: 'Zdavotnický pracovník' },
      { id: REQUESTOR_TYPE_KHS,
        label: 'Pracovník v sociálních službách' },
      { id: REQUESTOR_TYPE_SAMOPL,
        label: 'Pacient PZS' },
      { id: REQUESTOR_TYPE_AG,
        label: 'Klient instituce sociálních služeb' },
    ]
  }

  return (
    <RadioGroup
      id='requestor-type'
      label={label}
      value={value}
      setter={setValue}
      options={options}
    />
  )
}

export function InsuranceCompanySelection({ value, setValue }) {
  let options = [
    { id: INSURANCE_COMPANY_VZP,    label: 'VZP'        },
    { id: INSURANCE_COMPANY_VOZP,   label: 'VoZP'       },
    { id: INSURANCE_COMPANY_CPZP,   label: 'ČPZP'       },
    { id: INSURANCE_COMPANY_OZP,    label: 'OZP'        },
    { id: INSURANCE_COMPANY_ZPS,    label: 'ZPŠ'        },
    { id: INSURANCE_COMPANY_ZPMV,   label: 'ZPMV'       },
    { id: INSURANCE_COMPANY_RBP,    label: 'RBP'        },
    { id: INSURANCE_COMPANY_SAMOPL, label: 'Samoplátce' },
  ]

  if (config.app_type === APP_TYPE_COVID_TEST) {
    options.push(
      { id: INSURANCE_COMPANY_KHS,
        label: 'Cizinec bez zdravotní pojišťovny, indikovaný lékařem / KHS' },
    )
  }

  return (
    <RadioGroup
      id='insurance-company'
      label='Zdravotní pojišťovna'
      value={value}
      setter={setValue}
      options={options}
    />
  )
}

export function RequestFormCheckbox({ checked, setChecked }) {
  return (
    <Form.Group id="have-request-form">
      <Form.Check
        required
        type="checkbox"
        label="Mám vystavenu elektronickou žádanku od mého PL/PLDD nebo z KHS"
        checked={checked}
        onChange={() => setChecked(!checked)}
        isInvalid={!checked}
        feedback='Bez této žádanky NENÍ další registrace možná, vyšetření nebude provedeno.'
      />
    </Form.Group>
  )
}

export function FirstNameInput({ value, setValue, as }) {
  return (
    <Form.Group as={as} controlId="first-name">
      <Form.Label>Jméno</Form.Label>
      <Form.Control required
        type="text"
        placeholder="Vaše křestní jméno"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        isInvalid={!value}
      />
      <Form.Control.Feedback type="invalid">
        Tato položka je povinná
      </Form.Control.Feedback>
    </Form.Group>
  )
}

export function LastNameInput({ value, setValue, as }) {
  return (
    <Form.Group as={as} controlId="last-name">
      <Form.Label>Příjmení</Form.Label>
      <Form.Control required
        type="text"
        placeholder="Vaše příjmení"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        isInvalid={!value}
      />
      <Form.Control.Feedback type="invalid">
        Tato položka je povinná
      </Form.Control.Feedback>
    </Form.Group>
  )
}

export function MunicipalityInput({ value, setValue, as }) {
  return (
    <Form.Group as={as} controlId="municipality">
      <Form.Label>Město/obec, kde aktuálně pobýváte (nikoli ulice či č.p.)</Form.Label>
      <Form.Control required
        type="text"
        placeholder="Vaše současné místo pobytu (město/obec, ne ulice)"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        isInvalid={!value}
      />
      <Form.Control.Feedback type="invalid">
        Tato položka je povinná
      </Form.Control.Feedback>
    </Form.Group>
  )
}

export function ZipCodeInput({ value, setValue, isValid, as }) {
  return (
    <Form.Group as={as} controlId="zip-code">
      <Form.Label>PSČ</Form.Label>
      <Form.Control required
        type="text"
        placeholder="Vaše poštovní směrovací číslo"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        isInvalid={!isValid}
      />
      <Form.Control.Feedback type="invalid">
        {value ? 'Není validní PSČ' : 'Tato položka je povinná'}
      </Form.Control.Feedback>
    </Form.Group>
  )
}

export function EmailInput({ value, setValue, isValid, as }) {
  return (
    <Form.Group as={as} controlId="email">
      <Form.Label>E-mailová adresa</Form.Label>
      <Form.Control required
        type="email"
        placeholder="Vaše e-mailová adresa"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        isInvalid={!isValid}
      />
      <Form.Control.Feedback type="invalid">
        {value ? 'Není validní emailová adresa' : 'Tato položka je povinná'}
      </Form.Control.Feedback>
    </Form.Group>
  )
}

export function PhoneInput({ value, setValue, isValid, as }) {
  return (
    <Form.Group as={as} controlId="phone">
      <Form.Label>Telefonní číslo</Form.Label>
      <Form.Control required
        type="phone"
        placeholder="Vaše telefonní číslo"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        isInvalid={!isValid}
      />
      <Form.Control.Feedback type="invalid">
        {value ? 'Není validní telefonní číslo' : 'Tato položka je povinná'}
      </Form.Control.Feedback>
    </Form.Group>
  )
}

export function InsuranceNumberInput({ value, setValue, isValid, errors }) {
  return (
    <Form.Group controlId="insurance-number">
      <Form.Label>Číslo pojištěnce (bez lomítka)</Form.Label>
      <Form.Control required
        type="text"
        placeholder="Vaše číslo pojištěnce"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        isInvalid={!isValid || errors}
      />
      <Form.Control.Feedback type="invalid">
        {value
          ? `Není validní číslo pojištěnce${errors ? ': ' + errors : ''}`
          : 'Tato položka je povinná'}
      </Form.Control.Feedback>
    </Form.Group>
  )
}
