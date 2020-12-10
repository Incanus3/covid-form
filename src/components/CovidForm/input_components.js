import { isWeekend   } from 'date-fns';
import { Alert, Form } from 'react-bootstrap';

import { RadioGroup, ResponsiveDatePicker } from 'src/utils/components';

import {
  REQUESTOR_TYPE_AG, REQUESTOR_TYPE_PL, REQUESTOR_TYPE_KHS, REQUESTOR_TYPE_SAMOPL,
  INSURANCE_COMPANY_KHS, INSURANCE_COMPANY_VZP, INSURANCE_COMPANY_VOZP, INSURANCE_COMPANY_CPZP,
  INSURANCE_COMPANY_OZP, INSURANCE_COMPANY_ZPS, INSURANCE_COMPANY_ZPMV, INSURANCE_COMPANY_RBP,
  INSURANCE_COMPANY_SAMOPL
} from './constants';

export function ExamTypeSelection({
  examTypes, examTypeId, setExamType, setRequestorType, loading, loadTimeSlots
}) {
  const id    = 'examination-type';
  const label = 'Jaký druh vyšetření požadujete?';

  if (loading || examTypes.lenth === 0) {
    let alertVariant, alertText;

    if (loading) {
      alertVariant = 'info';
      alertText    = 'Načítám druhy vyšetření';
    } else {
      alertVariant = 'danger';
      alertText    = 'Nebyly nalezeny žádné druhy vyšetření.';
    }

    return (
      <Form.Group controlId={id}>
        <Form.Label>{label}</Form.Label>
        <Alert variant={alertVariant}>{alertText}</Alert>
      </Form.Group>
    )
  } else {
    const options  = examTypes.map(examType => ({ id: examType.id, label: examType.description }))
    const onChange = (examTypeId) => { loadTimeSlots(examTypeId); setExamType(examTypeId); }

    return (
      <RadioGroup id={id} label={label} value={examTypeId} setter={onChange} options={options} />
    )
  }
}

export function ExamDateSelection({ value, setValue, minDate, maxDate, disabledDates }) {
  return (
    <Form.Group controlId="examination-date">
      <Form.Label>Datum vyšetření</Form.Label>
      <ResponsiveDatePicker inline disabledKeyboardNavigation
        id='examination-date'
        selected={value}
        onChange={date => setValue(date)}
        minDate={minDate}
        maxDate={maxDate}
        excludeDates={disabledDates}
        filterDate={(date) => !isWeekend(date)}
      />
    </Form.Group>
  )
}

export function ExamTimeSelection({ options, value, setValue, loading }) {
  if (loading || options.length === 0) {
    let alertVariant, alertText;

    if (loading) {
      alertVariant = 'info';
      alertText    = 'Načítám časové sloty';
    } else {
      alertVariant = 'danger';
      alertText    = 'Pro zvolený druh vyšetření nebyly nalezeny žádné časové sloty.';
    }

    return (
      <Form.Group controlId="examination-date">
        <Form.Label>Čas vyšetření</Form.Label>
        <Alert variant={alertVariant}>{alertText}</Alert>
      </Form.Group>
    )
  } else {
    return (
      <RadioGroup
        id='time-slot'
        label='Čas vyšetření'
        value={value}
        setter={setValue}
        options={options.map(slot => ({ id: slot.id, label: slot.time_range }))}
      />
    )
  }
}

export function RequestorTypeSelection({ value, setValue, disabledValues }) {
  return (
    <RadioGroup
      id='requestor-type'
      label='Kdo vyšetření požaduje?'
      value={value}
      setter={setValue}
      disabledIds={disabledValues}
      options={[
        { id: REQUESTOR_TYPE_AG,
          label: 'Učitel (jsem pedagogickým pracovníkem)' },
        { id: REQUESTOR_TYPE_PL,
          label: 'PL / PLDD (odeslal mne můj ošetřující lékař)' },
        { id: REQUESTOR_TYPE_KHS,
          label: 'KHS (k vyšetření jsem indikován hygienikem)' },
        { id: REQUESTOR_TYPE_SAMOPL,
          label: 'SAMOPLÁTCE (vyšetření si hradím sám a požaduji jej pouze pro svou potřebu)' },
      ]}
    />
  )
}

export function InsuranceCompanySelection({ value, setValue }) {
  return (
    <RadioGroup
      id='insurance-company'
      label='Zdravotní pojišťovna'
      value={value}
      setter={setValue}
      options={[
        { id: INSURANCE_COMPANY_VZP,    label: 'VZP'        },
        { id: INSURANCE_COMPANY_VOZP,   label: 'VoZP'       },
        { id: INSURANCE_COMPANY_CPZP,   label: 'ČPZP'       },
        { id: INSURANCE_COMPANY_OZP,    label: 'OZP'        },
        { id: INSURANCE_COMPANY_ZPS,    label: 'ZPŠ'        },
        { id: INSURANCE_COMPANY_ZPMV,   label: 'ZPMV'       },
        { id: INSURANCE_COMPANY_RBP,    label: 'RBP'        },
        { id: INSURANCE_COMPANY_SAMOPL, label: 'Samoplátce' },
        { id: INSURANCE_COMPANY_KHS,
          label: 'Cizinec bez zdravotní pojišťovny, indikovaný lékařem / KHS' },
      ]}
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
      <Form.Label>Město/obec, kde aktuálně pobýváte</Form.Label>
      <Form.Control required
        type="text"
        placeholder="Vaše současné místo pobytu (město/obec)"
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