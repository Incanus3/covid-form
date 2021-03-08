import _ from 'lodash'

import { useState, useEffect, useContext } from 'react'
import { withRouter, RouteComponentProps } from 'react-router-dom'
import { Alert, Container, Card          } from 'react-bootstrap'

import { formatDateHuman                      } from 'src/utils/generic';
import { AsyncResult                          } from 'src/utils/results'
import { ConfirmModal                         } from 'src/utils/components'
import { Auth, AuthContext                    } from 'src/auth'
import { Entity, DailyOverride, JSONData } from 'src/models'
import { DailyOverrideCRUDService             } from 'src/services/crud'

import Modal from './Modal'
import Table from './Table'

function DailyOverridesManagement({ history }: RouteComponentProps) {
  const auth = useContext<Auth | null>(AuthContext) as Auth

  const dailyOverrideService = new DailyOverrideCRUDService(auth, history)

  const [errors,    setErrors   ] = useState<string[]  >([])
  const [dailyOverrides, setDailyOverrides] = useState<DailyOverride[]>([])
  /* const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]) */
  /* const [settings,  setSettings ] = useState<Settings  >({}) */
  const [editedId,  setEditedId ] = useState<number | null>(null)
  const [deletedId, setDeletedId] = useState<number | null>(null)
  const [creating,  setCreating ] = useState<boolean>(false)

  function getDeleted(): DailyOverride | undefined {
    return _.find(dailyOverrides, (override: DailyOverride) => override.id === deletedId)
  }

  async function loadDailyOverrides() {
    (await dailyOverrideService.loadAll()
    ).onSuccess(async (dailyOverrides) => { setDailyOverrides(dailyOverrides) })
  }

  async function submit(dailyOverride: DailyOverride): Promise<AsyncResult<DailyOverride, string>> {
    let result

    if (creating) {
      result = await dailyOverrideService.create(dailyOverride)

      result.onSuccess(async () => setCreating(false))
    } else {
      result = await dailyOverrideService.update(editedId as number, dailyOverride)

      result.onSuccess(async () => setEditedId(null))
    }

    result.onSuccess(async () => loadDailyOverrides())

    return result
  }

  useEffect(() => {
    loadDailyOverrides()
    // eslint-disable-next-line
  }, [])

  return (
    <Container>
      <Card id='time-slot-management-card'>
        <Card.Header>Nastavení denních kapacit</Card.Header>

        <Card.Body>
          {errors.length && <Alert variant='danger'>{_.join(errors)}</Alert> || null}

          {dailyOverrides &&
            <Table
              create={() => setCreating(true)}
              edit={  (dailyOverride: Entity) => setEditedId( dailyOverride.id)}
              remove={(dailyOverride: Entity) => setDeletedId(dailyOverride.id)}
              entities={dailyOverrides}
            />}
        </Card.Body>
      </Card>

      {(creating || editedId) && <Modal
        hide={() => creating ? setCreating(false) : setEditedId(null)}
        submit={submit}
        entity={creating ? new DailyOverride({}) : _.find(dailyOverrides, { id: editedId })}
      />}

      {deletedId && <ConfirmModal
        title='Smazání nastavení denní kapacity'
        prompt={
          'Skutečně chcete smazat nastavení denní kapacity na '
          + formatDateHuman((getDeleted() as DailyOverride).date) + '?'
        }
        onConfirm={async () => {
          const result = await dailyOverrideService.delete(deletedId)

          result.onSuccess(async     () => { setErrors([]); loadDailyOverrides() })
          result.onFailure(async (data: JSONData) => {
            setErrors([`Nemohu smazat nastavení denní kapacity: ${data.error}.`])
          })

          setDeletedId(null)
        }}
        onCancel={() => setDeletedId(null)}
      />}
    </Container>
  )
}

export default withRouter(DailyOverridesManagement)
