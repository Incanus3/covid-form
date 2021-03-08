import _ from 'lodash'

import { useState, useEffect, useContext } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Container, Card                 } from 'react-bootstrap'

import { Auth, AuthContext                   } from 'src/auth'
import { Setting                             } from 'src/models'
import { SettingCRUDService                  } from 'src/services/crud'
import { Settings, loadSettings, saveSetting } from 'src/utils/settings'
import SettingsForm                            from './Form'

function SettingsManagement({ history }: RouteComponentProps) {
  const auth = useContext<Auth | null>(AuthContext) as Auth

  const settingsService = new SettingCRUDService(auth, history)

  const [settings, setSettings] = useState<Settings>({})

  useEffect(() => {
    loadSettings(settingsService, setSettings)
    // eslint-disable-next-line
  }, [])

  return (
    <Container>
      <Card id='time-slot-management-card'>
        <Card.Header>Obecná nastavení</Card.Header>

        <Card.Body>
          {!_.isEmpty(settings) &&
            <SettingsForm
              settings={settings}
              saveSetting={async (setting: Setting) => {
                return (await saveSetting(settingsService, setting)
                ).onSuccess(() => loadSettings(settingsService, setSettings))
              }}
            />}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default withRouter(SettingsManagement)
