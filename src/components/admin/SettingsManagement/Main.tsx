import _ from 'lodash'

import { useState, useEffect, useContext } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Container, Card                 } from 'react-bootstrap'

import { camelToSnakeCase, keysToCamelCase } from 'src/utils/generic'
import { AsyncResult                       } from 'src/utils/results'
import { Auth, AuthContext                 } from 'src/auth'
import { Setting, JSONData                 } from 'src/models'
import { SettingCRUDService                } from 'src/services/crud'
import { ERROR_CODE_NOT_FOUND              } from 'src/constants'
import SettingsForm                          from './Form'

type Settings = Record<string, any>

function settingsToObject(settings: Setting[]): Settings {
  return keysToCamelCase(_.fromPairs(
    settings.map((setting) => [setting.key, setting.value])
  ))
}

function SettingsManagement({ history }: RouteComponentProps) {
  const auth = useContext<Auth | null>(AuthContext) as Auth

  const settingsService = new SettingCRUDService(auth, history)

  const [settings, setSettings] = useState<Settings>({})

  async function loadSettings() {
    (await settingsService.loadAll()).onSuccess(async (settings: Setting[]) => {
      setSettings(settingsToObject(settings))
    })
  }

  async function saveSetting({ key, value }: Setting): Promise<AsyncResult<Setting, any>> {
    key = camelToSnakeCase(key)

    let result = await settingsService.update(key, new Setting({ key, value }))

    await result.onFailure(async (data: JSONData) => {
      if (data.code === ERROR_CODE_NOT_FOUND) {
        result = await settingsService.create(new Setting({ key, value }))
      }
    })

    await result.onSuccess(loadSettings)

    return result
  }

  useEffect(() => {
    loadSettings()
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

export default withRouter(SettingsManagement)
