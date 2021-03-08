import _ from 'lodash'

import { useState                           } from 'react'
import { Row, Col, Form, InputGroup, Button } from 'react-bootstrap'
import Select                                 from 'react-select'

import { AsyncResult } from 'src/utils/results'
import { Setting     } from 'src/models'

import ExplanationAlert from './ExplanationAlert'

type WeekDay      = { id: number, label: string }
type Settings     = Record<string, any>
type SettingSaver = (setting: Setting) => Promise<AsyncResult<Setting, any>>

const weekDayOptions: WeekDay[] = [
  { id: 1, label: 'Pondělím' },
  { id: 2, label: 'Úterým'   },
  { id: 3, label: 'Středou'  },
  { id: 4, label: 'Čtvrtkem' },
  { id: 5, label: 'Pátkem'   },
  { id: 6, label: 'Sobotou'  },
  { id: 0, label: 'Nedělí'   },
]

function toSetting(settingObject: Settings) {
  const pairs = _.toPairs(settingObject)

  if (pairs.length !== 1) { throw 'settingsObject must have exactly one key-value pair' }

  const [key, value] = _.first(pairs) as [string, any]

  return new Setting({ key, value })
}

export default function SettingsForm({ settings, saveSetting }: { settings: Settings, saveSetting: SettingSaver }) {
  const [openRegistrationInWeeks,  setOpenRegistrationIn]     = useState(settings.openRegistrationInWeeks)
  const [closeRegistrationInWeeks, setCloseRegistrationIn]    = useState(settings.closeRegistrationInWeeks)
  const [dailyRegistrationLimit,   setDailyRegistrationLimit] = useState(settings.dailyRegistrationLimit)
  const [weekStartsOn,             setWeekStartsOn]           = useState(settings.weekStartsOn)

  const inputIsValid =
    _.isNumber(dailyRegistrationLimit) &&
    _.isNumber(openRegistrationInWeeks) &&
    _.isNumber(closeRegistrationInWeeks) &&
    _.isNumber(weekStartsOn)

  const somethingChanged =
    (weekStartsOn             !== settings.weekStartsOn)            ||
    (dailyRegistrationLimit   !== settings.dailyRegistrationLimit)  ||
    (openRegistrationInWeeks  !== settings.openRegistrationInWeeks) ||
    (closeRegistrationInWeeks !== settings.closeRegistrationInWeeks)

  const disableSubmit = !inputIsValid || !somethingChanged

  async function saveChanges() {
    if (weekStartsOn !== settings.weekStartsOn) {
      await saveSetting(toSetting({ weekStartsOn }))
    }

    if (dailyRegistrationLimit !== settings.dailyRegistrationLimit) {
      await saveSetting(toSetting({ dailyRegistrationLimit }))
    }

    if (openRegistrationInWeeks !== settings.openRegistrationInWeeks) {
      await saveSetting(toSetting({ openRegistrationInWeeks }))
    }

    if (closeRegistrationInWeeks !== settings.closeRegistrationInWeeks) {
      await saveSetting(toSetting({ closeRegistrationInWeeks }))
    }
  }

  return (
    <Form noValidate id='settings-form'>
      <Form.Group id='daily-registration-limit' as={Row}>
        <Form.Label column sm={6}>Výchozí denní kapacita</Form.Label>
        <Col sm={6}>
          <Form.Control required
            type="number"
            value={isNaN(dailyRegistrationLimit) ? '' : dailyRegistrationLimit}
            onChange={(e) => setDailyRegistrationLimit(parseInt(e.target.value))}
            isInvalid={!_.isNumber(dailyRegistrationLimit)}
          />
          <Form.Control.Feedback type="invalid">
            Tato položka je povinná
          </Form.Control.Feedback>
        </Col>
      </Form.Group>

      <Form.Group id='week-starts-on' as={Row}>
        <Form.Label column sm={6}>Týden začíná</Form.Label>
        <Col sm={6}>
          <Select
            options={weekDayOptions}
            value={_.find(weekDayOptions, { id: weekStartsOn })}
            onChange={(value) => setWeekStartsOn((value as WeekDay).id)}
            getOptionValue={(weekDay) => weekDay.id.toString()}
            getOptionLabel={(weekDay) => weekDay.label}
            isSearchable={false}
            closeMenuOnSelect={true}
          />
        </Col>
      </Form.Group>

      <Form.Group id='open-registration-in-weeks' as={Row}>
        <Form.Label column sm={6}>Otevřít registraci počínaje datem za</Form.Label>
        <Col sm={6}>
          <InputGroup>
            <Form.Control required
              type="number"
              value={isNaN(openRegistrationInWeeks) ? '' : openRegistrationInWeeks}
              onChange={(e) => setOpenRegistrationIn(parseInt(e.target.value))}
              isInvalid={!_.isNumber(openRegistrationInWeeks)}
            />
            <InputGroup.Append>
              <InputGroup.Text>týdnů</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
          <Form.Control.Feedback type="invalid">
            Tato položka je povinná
          </Form.Control.Feedback>
        </Col>
      </Form.Group>

      <Form.Group id='close-registration-in-weeks' as={Row}>
        <Form.Label column sm={6}>Uzavřít registraci po datu za</Form.Label>
        <Col sm={6}>
          <InputGroup>
            <Form.Control required
              type="number"
              value={isNaN(closeRegistrationInWeeks) ? '' : closeRegistrationInWeeks}
              onChange={(e) => setCloseRegistrationIn(parseInt(e.target.value))}
              isInvalid={!_.isNumber(closeRegistrationInWeeks)}
            />
            <InputGroup.Append>
              <InputGroup.Text>týdnů</InputGroup.Text>
            </InputGroup.Append>
          </InputGroup>
          <Form.Control.Feedback type="invalid">
            Tato položka je povinná
          </Form.Control.Feedback>
        </Col>
      </Form.Group>

      <Row>
        <Col sm={12}>
          <Button
            variant="primary"
            disabled={disableSubmit}
            onClick={saveChanges}
          >
            Uložit změny
          </Button>
        </Col>
      </Row>

      <Row>
        <Col sm={12}>
          <ExplanationAlert />
        </Col>
      </Row>
    </Form>
  )
}
