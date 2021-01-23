import _ from 'lodash';

import React, { useState, useEffect, useContext } from 'react';
import { withRouter, RouteComponentProps        } from 'react-router-dom';
import { Alert, Container, Card                 } from 'react-bootstrap';

import { AsyncResult                              } from 'src/utils/results';
import { ConfirmModal                             } from 'src/utils/components';
import { Entity, ExamType, TimeSlot, JSONData     } from 'src/models';
import { ExamTypeCRUDService, TimeSlotCRUDService } from 'src/services/crud';
import { Auth, AuthContext                        } from 'src/auth';

import TimeSlotModal from './Modal'
import TimeSlotTable from './Table'

function TimeSlotManagement({ history }: RouteComponentProps) {
  const auth = useContext<Auth | null>(AuthContext) as Auth;

  const timeSlotService = new TimeSlotCRUDService(auth, history);
  const examTypeService = new ExamTypeCRUDService(auth, history);

  const [errors,    setErrors   ] = useState<string[]  >([]);
  const [examTypes, setExamTypes] = useState<ExamType[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [settings,  setSettings ] = useState<Entity | null>(null);
  const [editedId,  setEditedId ] = useState<number | null>(null);
  const [deletedId, setDeletedId] = useState<number | null>(null);
  const [creating,  setCreating ] = useState<boolean>(false);

  function getDeletedSlot(): TimeSlot | undefined {
    return _.find(timeSlots, (timeSlot: TimeSlot) => timeSlot.id === deletedId)
  }

  async function loadSettings() {
    (await (
      await auth.authenticatedRequestWithLogoutWhenSessionExpired(history, 'GET', '/admin/settings')
    ).chain(AsyncResult.fromResponse)
    ).onSuccess(async (data) => setSettings(data.settings))
  }

  async function loadExamTypes() {
    (await examTypeService.loadAll()
    ).onSuccess(async (examTypes) => { setExamTypes(examTypes) });
  }

  async function loadTimeSlots() {
    (await timeSlotService.loadAll({ withAssocs: 'exam_types' })
    ).onSuccess(async (timeSlots) => { setTimeSlots(timeSlots) });
  }

  async function submit(timeSlot: TimeSlot): Promise<AsyncResult<TimeSlot, string>> {
    let result;

    if (creating) {
      result = await timeSlotService.create(timeSlot)

      result.onSuccess(async () => setCreating(false))
    } else {
      result = await timeSlotService.update(editedId as number, timeSlot);

      result.onSuccess(async () => setEditedId(null))
    }

    result.onSuccess(async () => loadTimeSlots());

    return result;
  }

  useEffect(() => {
    loadSettings();
    loadExamTypes();
    loadTimeSlots();
    // eslint-disable-next-line
  }, [])

  return (
    <Container>
      <Card id='time-slot-management-card'>
        <Card.Header>Nastavení časových slotů</Card.Header>

        <Card.Body>
          {errors.length && <Alert variant='danger'>{_.join(errors)}</Alert> || null}

          {settings &&
            <p>
              Nastavená denní kapacita je <strong>{settings.daily_registration_limit}</strong>.
            </p>
          }

          {settings && timeSlots &&
            <TimeSlotTable
              create={() => setCreating(true)}
              edit={  (timeSlot: Entity) => setEditedId( timeSlot.id)}
              remove={(timeSlot: Entity) => setDeletedId(timeSlot.id)}
              timeSlots={timeSlots}
              dailyRegistrationLimit={settings?.daily_registration_limit}
            />}
        </Card.Body>
      </Card>

      {(creating || editedId) && <TimeSlotModal
        hide={() => creating ? setCreating(false) : setEditedId(null)}
        submit={submit}
        timeSlot={creating ? new TimeSlot() : _.find(timeSlots, { id: editedId })}
        availableExamTypes={examTypes}
      />}

      {deletedId && <ConfirmModal
        title='Smazání časového slotu'
        prompt={`Skutečně chcete smazat časový slot "${(getDeletedSlot() as TimeSlot).name}"?`}
        onConfirm={async () => {
          const result = await timeSlotService.delete(deletedId);

          result.onSuccess(async     () => { setErrors([]); loadTimeSlots() });
          result.onFailure(async (data: JSONData) => {
            setErrors([`Nemohu smazat časový slot: ${data.error}.`]);
          })

          setDeletedId(null);
        }}
        onCancel={() => setDeletedId(null)}
      />}
    </Container>
  )
}

export default withRouter(TimeSlotManagement);
