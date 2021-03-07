import _ from 'lodash';

import { useState, useEffect, useContext         } from 'react';
import { withRouter, RouteComponentProps         } from 'react-router-dom';
import { Row, Col, Container, Alert, Card, Form, InputGroup, Button } from 'react-bootstrap';
import Select                                      from 'react-select'

import { camelToSnakeCase, keysToCamelCase } from 'src/utils/generic';
import { AsyncResult                       } from 'src/utils/results';
import { Auth, AuthContext                 } from 'src/auth';
import { Setting, JSONData                 } from 'src/models';
import { SettingCRUDService                } from 'src/services/crud';
import { ERROR_CODE_NOT_FOUND              } from 'src/constants';

type Settings     = Record<string, any>
type SettingSaver = (setting: Setting) => Promise<AsyncResult<Setting, any>>
type WeekDay      = { id: number, label: string }

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

function settingsToObject(settings: Setting[]): Settings {
  return keysToCamelCase(_.fromPairs(
    settings.map((setting) => [setting.key, setting.value])
  ))
}

function SettingsForm({ settings, saveSetting }: { settings: Settings, saveSetting: SettingSaver }) {
  console.log('rendering SettingsForm')
  console.log(settings)

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
        </Col>
      </Row>
    </Form>
  )
}

function SettingsManagement({ history }: RouteComponentProps) {
  const auth = useContext<Auth | null>(AuthContext) as Auth;

  const settingsService = new SettingCRUDService(auth, history);

  const [settings, setSettings] = useState<Settings>({});

  async function loadSettings() {
    (await settingsService.loadAll()).onSuccess(async (settings) => {
      setSettings(settingsToObject(settings))
    });
  }

  async function saveSetting({ key, value }: Setting): Promise<AsyncResult<Setting, any>> {
    key = camelToSnakeCase(key)

    let result = await settingsService.update(key, new Setting({ key, value }));

    await result.onFailure(async (data: JSONData) => {
      if (data.code === ERROR_CODE_NOT_FOUND) {
        result = await settingsService.create(new Setting({ key, value }));
      }
    })

    await result.onSuccess(loadSettings)

    return result
  }

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line
  }, [])

  return (
    <Container>
      <Card id='time-slot-management-card'>
        <Card.Header>Obecná nastavení</Card.Header>

        <Card.Body>
          {!_.isEmpty(settings) &&
            <SettingsForm settings={settings} saveSetting={saveSetting} />}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default withRouter(SettingsManagement);
