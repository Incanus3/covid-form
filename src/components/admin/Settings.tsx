import _ from 'lodash';

import { useState, useEffect, useContext         } from 'react';
import { withRouter, RouteComponentProps         } from 'react-router-dom';
import { Row, Col, Container, Card, Form, Button } from 'react-bootstrap';

import { camelToSnakeCase, keysToCamelCase } from 'src/utils/generic';
import { AsyncResult                       } from 'src/utils/results';
import { Auth, AuthContext                 } from 'src/auth';
import { Setting, JSONData                 } from 'src/models';
import { SettingCRUDService                } from 'src/services/crud';
import { ERROR_CODE_NOT_FOUND              } from 'src/constants';

type Settings     = Record<string, any>
type SettingSaver = (setting: Setting) => Promise<AsyncResult<Setting, any>>

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
  const [dailyRegistrationLimit, setDailyRegistrationLimit] =
    useState(settings.dailyRegistrationLimit)

  const inputIsValid     = dailyRegistrationLimit
  const somethingChanged = dailyRegistrationLimit !== settings.dailyRegistrationLimit
  const disableSubmit    = !inputIsValid || !somethingChanged

  async function saveChanges() {
    const result = await saveSetting(toSetting({ dailyRegistrationLimit }))

    return result;
  }

  return (
    <Form noValidate id='settings-form'>
      <Form.Group id='daily-registration-limit' as={Row}>
        <Form.Label column sm={5}>Výchozí denní kapacita</Form.Label>
        <Col sm={7}>
          <Form.Control required
            type="number"
            value={isNaN(dailyRegistrationLimit) ? '' : dailyRegistrationLimit}
            onChange={(e) => setDailyRegistrationLimit(parseInt(e.target.value))}
            isInvalid={!dailyRegistrationLimit}
          />
          <Form.Control.Feedback type="invalid">
            Tato položka je povinná
          </Form.Control.Feedback>
        </Col>
      </Form.Group>

      <Button
        variant="primary"
        disabled={disableSubmit}
        onClick={saveChanges}
      >
        Uložit změny
      </Button>
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
