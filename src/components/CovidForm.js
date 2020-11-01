import { add, parseISO, isWeekend      } from 'date-fns';
import { capitalize, join, uniq        } from 'lodash';
import { useState, useEffect           } from 'react';
import { Alert, Form, Button, Row, Col } from 'react-bootstrap';

import { jsonRequest                      } from '../backend';
import { formatDate, keysToSnakeCase      } from '../utils/generic';
import { RadioGroup, ResponsiveDatePicker } from '../utils/components';

const ZIP_REGEX    = /^\d{3} ?\d{2}$/;
const EMAIL_REGEX  = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-.]+\.[a-zA-Z0-9-]{2,}$/;
const PHONE_PREFIX = '(\\+|00)\\d{2,3}'
const PHONE_REGEX  = RegExp(`^(${PHONE_PREFIX}|\\(${PHONE_PREFIX}\\))? ?[1-9]\\d{2} ?\\d{3} ?\\d{3}$`);

const EXAM_TYPE_PCR   = 'pcr'
const EXAM_TYPE_RAPID = 'rapid'

const REQUESTOR_TYPE_PL     = 'pl'
const REQUESTOR_TYPE_KHS    = 'khs'
const REQUESTOR_TYPE_SAMOPL = 'samopl'

const INSURANCE_COMPANY_VZP    = 111
const INSURANCE_COMPANY_VOZP   = 201
const INSURANCE_COMPANY_CPZP   = 205
const INSURANCE_COMPANY_OZP    = 207
const INSURANCE_COMPANY_ZPS    = 209
const INSURANCE_COMPANY_ZPMV   = 211
const INSURANCE_COMPANY_RBP    = 213
const INSURANCE_COMPANY_SAMOPL = 300
const INSURANCE_COMPANY_KHS    = 999

function isValidInsuranceNumber(input) {
  const length = input.length;

  return input.match(/^\d{9,10}$/) && (length === 9 || input % 11 === 0);
}

export default function CovidForm() {
  const [examType,         setExamType]         = useState(EXAM_TYPE_PCR);
  const [requestorType,    setRequestorType]    = useState(REQUESTOR_TYPE_PL);
  const [haveRequestForm,  setHaveRequestForm]  = useState(false);
  const [examDate,         setExamDate]         = useState(add(new Date(), { days: 1 }));
  const [timeSlotId,       setTimeSlotId]       = useState(null);
  const [firstName,        setFirstName]        = useState('');
  const [lastName,         setLastName]         = useState('');
  const [municipality,     setMunicipality]     = useState('');
  const [zipCode,          setZipCode]          = useState('');
  const [email,            setEmail]            = useState('');
  const [phoneNumber,      setPhoneNumber]      = useState('');
  const [insuranceNumber,  setInsuranceNumber]  = useState('');
  const [insuranceCompany, setInsuranceCompany] = useState(111);
  const [responseData,     setResponseData]     = useState(null);
  const [timeSlots,        setTimeSlots]        = useState(null);
  const [fullDates,        setFullDates]        = useState(null);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(true);
  const [loadingFullDates, setLoadingFullDates] = useState(true);

  const minDate = new Date();
  const maxDate = add(new Date(), { months: 2 });

  useEffect(() => {
    async function loadTimeSlots() {
      const { body: data } = await jsonRequest('GET', '/crud/time_slots');
      // TODO: handle failure
      setTimeSlots(data.time_slots);
      setTimeSlotId(data.time_slots[0].id);
      setLoadingTimeSlots(false);
    }
    loadTimeSlots();
  }, [])

  useEffect(() => {
    async function loadFullDates() {
      const { body: data } = await jsonRequest('GET', '/capacity/full_dates', {
        params: { start_date: formatDate(minDate), end_date: formatDate(maxDate) }
      });
      // TODO: handle failure
      setFullDates(data.dates.map((date) => parseISO(date)));
      console.log('HERE')
      console.log(data)
      setLoadingFullDates(false);
    }
    loadFullDates();
  }, [])

  const submit = async () => {
    const data = {
      client: keysToSnakeCase({
        firstName, lastName, municipality, zipCode,
        email, phoneNumber, insuranceNumber, insuranceCompany,
      }),
      exam: keysToSnakeCase({
        requestorType, examType, examDate, timeSlotId
      })
    };

    console.log('submitting', data);

    const { body } = await jsonRequest('post', '/register', { data });
    console.log(body);
    setResponseData(body);
  }

  const reset = () => {
    setHaveRequestForm(false);
    setFirstName('');
    setLastName('');
    setPhoneNumber('');
    setInsuranceNumber('');
    setInsuranceCompany(111);
    setResponseData(null);
  }

  const zipIsValid    = zipCode.match(ZIP_REGEX);
  const emailIsValid  = email.match(EMAIL_REGEX);
  const phoneIsValid  = phoneNumber.match(PHONE_REGEX);
  const insNumIsValid = insuranceCompany === INSURANCE_COMPANY_KHS
    || isValidInsuranceNumber(insuranceNumber);
  const canSubmit = firstName && lastName && municipality
    && zipIsValid && emailIsValid && phoneIsValid && insNumIsValid
    && (requestorType === REQUESTOR_TYPE_SAMOPL || haveRequestForm);

  const hasRegistered = responseData?.status === 'OK';
  const disableSubmit = !canSubmit || hasRegistered;

  var commonErrors = null;
  var insuranceNumberErrors = null;
  var responseAlert = null;

  switch(responseData?.status) {
    case 'OK':
      responseAlert = <Alert variant='success'>Vaše registrace byla úspěšná</Alert>;
      break;
    case 'ERROR':
      if (responseData.error) {
        commonErrors = join(responseData.error.map((error) => capitalize(error) + '.'), ' ');
      } else {
        commonErrors = 'Došlo k chybě';
      }

      if (responseData.client && responseData.client.insurance_number) {
        insuranceNumberErrors = join(uniq(responseData.client.insurance_number), ', ');
      }

      responseAlert = <Alert variant='danger'>{commonErrors}</Alert>;
      break;
    default:
      responseAlert = null;
  }

  if (loadingTimeSlots || loadingFullDates) {
    return (
      <div>
        {loadingTimeSlots &&
         <Alert variant='info'>Načítám časové sloty</Alert>}
        {loadingFullDates &&
         <Alert variant='info'>Načítám kapacity pro jednotlivé dny</Alert>}
      </div>
    )
  } else {
    return (
      <Form noValidate id="covid-form">
        <RadioGroup
          id='examination-type'
          label='Jaký druh vyšetření požadujete?'
          value={examType}
          setter={setExamType}
          options={[
            { id: EXAM_TYPE_PCR,
                label: 'PCR vyšetření (výtěr z nosu a následné laboratorní zpracování)' },
            { id: EXAM_TYPE_RAPID,
              label: 'RAPID test (orientační test z kapky krve)' },
          ]}
        />

        <RadioGroup
          id='requestor-type'
          label='Kdo vyšetření požaduje?'
          value={requestorType}
          setter={setRequestorType}
          options={[
            { id: REQUESTOR_TYPE_PL,
                label: 'PL / PLDD (odeslal mne můj ošetřující lékař)' },
            { id: REQUESTOR_TYPE_KHS,
              label: 'KHS (k vyšetření jsem indikován hygienikem)' },
            { id: REQUESTOR_TYPE_SAMOPL,
              label: 'SAMOPLÁTCE (vyšetření si hradím sám a požaduji jej pouze pro svou potřebu)' },
          ]}
        />

        {requestorType === REQUESTOR_TYPE_SAMOPL ||
          <Form.Group id="have-request-form">
            <Form.Check
              required
              type="checkbox"
              label="Mám vystavenu elektronickou žádanku od mého PL/PLDD nebo z KHS"
              checked={haveRequestForm}
              onChange={() => setHaveRequestForm(!haveRequestForm)}
              isInvalid={!haveRequestForm}
              feedback='Bez této žádanky NENÍ další registrace možná, vyšetření nebude provedeno.'
            />
          </Form.Group>}

        <Form.Group controlId="examination-date">
          <Form.Label>Datum vyšetření</Form.Label>
          <ResponsiveDatePicker inline disabledKeyboardNavigation
            id='examination-date'
            selected={examDate}
            onChange={date => setExamDate(date)}
            minDate={minDate}
            maxDate={maxDate}
            excludeDates={fullDates}
            filterDate={(date) => !isWeekend(date)}
          />
        </Form.Group>

        <RadioGroup
          id='time-slot'
          label='Čas vyšetření'
          value={timeSlotId}
          setter={setTimeSlotId}
          options={timeSlots.map(slot => ({ id: slot.id, label: slot.time_range }))}
        />

        <Form.Row>
          <Form.Group as={Col} controlId="first-name">
            <Form.Label>Jméno</Form.Label>
            <Form.Control required
              type="text"
              placeholder="Vaše křestní jméno"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              isInvalid={!firstName}
            />
            <Form.Control.Feedback type="invalid">
              Tato položka je povinná
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} controlId="last-name">
            <Form.Label>Příjmení</Form.Label>
            <Form.Control required
            type="text"
            placeholder="Vaše příjmení"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            isInvalid={!lastName}
            />
            <Form.Control.Feedback type="invalid">
              Tato položka je povinná
            </Form.Control.Feedback>
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col} controlId="municipality">
            <Form.Label>Město/obec, kde aktuálně pobýváte</Form.Label>
          <Form.Control required
            type="text"
            placeholder="Vaše současné místo pobytu (město/obec)"
            value={municipality}
            onChange={(e) => setMunicipality(e.target.value)}
            isInvalid={!municipality}
          />
        <Form.Control.Feedback type="invalid">
          Tato položka je povinná
        </Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} controlId="zip-code">
            <Form.Label>PSČ</Form.Label>
            <Form.Control required
            type="text"
            placeholder="Vaše poštovní směrovací číslo"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            isInvalid={!zipIsValid}
            />
            <Form.Control.Feedback type="invalid">
              {zipCode ? 'Není validní PSČ' : 'Tato položka je povinná'}
            </Form.Control.Feedback>
          </Form.Group>
        </Form.Row>

        <Form.Row>
          <Form.Group as={Col} controlId="email">
            <Form.Label>E-mailová adresa</Form.Label>
            <Form.Control required
              type="email"
              placeholder="Vaše e-mailová adresa"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              isInvalid={!emailIsValid}
            />
            <Form.Control.Feedback type="invalid">
              {email ? 'Není validní emailová adresa' : 'Tato položka je povinná'}
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group as={Col} controlId="phone">
            <Form.Label>Telefonní číslo</Form.Label>
            <Form.Control required
              type="phone"
              placeholder="Vaše telefonní číslo"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              isInvalid={!phoneIsValid}
            />
            <Form.Control.Feedback type="invalid">
              {phoneNumber ? 'Není validní telefonní číslo' : 'Tato položka je povinná'}
            </Form.Control.Feedback>
          </Form.Group>
        </Form.Row>

        <Form.Group controlId="insurance-number">
          <Form.Label>Číslo pojištěnce (bez lomítka)</Form.Label>
          <Form.Control required
          type="text"
          placeholder="Vaše číslo pojištěnce"
          value={insuranceNumber}
          onChange={(e) => setInsuranceNumber(e.target.value)}
          isInvalid={!insNumIsValid || insuranceNumberErrors}
          />
          <Form.Control.Feedback type="invalid">
            {insuranceNumber
              ? `Není validní číslo pojištěnce${insuranceNumberErrors ? ': ' + insuranceNumberErrors : ''}`
              : 'Tato položka je povinná'}
          </Form.Control.Feedback>
        </Form.Group>

        <RadioGroup
          id='insurance-company'
          label='Zdravotní pojišťovna'
          value={insuranceCompany}
          setter={setInsuranceCompany}
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

        <Row>
          <Col xs="auto">
            <Button
              variant={disableSubmit ? 'secondary' : 'primary'}
              size="lg"
              onClick={submit}
              disabled={disableSubmit}
            >
              Registrovat se
            </Button>
          </Col>

          <Col>
            {responseAlert}
          </Col>
        </Row>

        {hasRegistered &&
          <Button
            variant='primary'
            size="lg"
            onClick={reset}
          >
            Nové zadání
          </Button>}
      </Form>
    )
  }
}
