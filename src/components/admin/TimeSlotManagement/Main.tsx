import _ from 'lodash';

import React, { useState, useEffect, useContext } from 'react';
import { withRouter, RouteComponentProps        } from 'react-router-dom';
import { Alert, Container, Card                 } from 'react-bootstrap';

import { AsyncResult                       } from 'src/utils/results';
import { ConfirmModal                      } from 'src/utils/components';
import { ExamType, TimeSlot                } from 'src/models';
import { Auth, AuthContext, RequestOptions } from 'src/auth';

import TimeSlotModal from './Modal'
import TimeSlotTable from './Table'

type Entity = Record<string, any>;

function TimeSlotManagement({ history }: RouteComponentProps) {
  const auth = useContext<Auth | null>(AuthContext) as Auth;

  const [errors,    setErrors   ] = useState<string[]>([]);
  const [settings,  setSettings ] = useState<Entity   | null>(null);
  const [examTypes, setExamTypes] = useState<Entity[] | null>(null);
  const [timeSlots, setTimeSlots] = useState<Entity[] | null>(null);
  const [editedId,  setEditedId ] = useState<number   | null>(null);
  const [deletedId, setDeletedId] = useState<number   | null>(null);
  const [creating,  setCreating ] = useState<boolean>(false);

  function getDeletedSlot(): Entity { return _.find(timeSlots, { id: deletedId }) as Entity }

  async function loadData(
    path: string, options: RequestOptions, successHandler: (data: any) => void
  ): Promise<void> {
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history, 'GET', path, options))
      .onSuccess(async (response) => { response.ok && successHandler(await response.json()) })
  }

  async function createTimeSlot(values: Entity): Promise<AsyncResult<any, any>> {
    const data = values.toJSON();

    data.exam_types = _.map(data.exam_types, 'id');

    return (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
      'POST', '/admin/crud/time_slots', { data }
    )).chain(AsyncResult.fromResponse)
  }

  async function updateTimeSlot(id: number, values: Entity): Promise<AsyncResult<any, any>> {
    const data = values.toJSON();

    data.exam_types = _.map(data.exam_types, 'id');

    return (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
      'PUT', `/admin/crud/time_slots/${id}`, { data }
    )).chain(AsyncResult.fromResponse)
  }

  async function deleteTimeSlot(id: number): Promise<AsyncResult<any, any>> {
    return (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
      'DELETE', `/admin/crud/time_slots/${id}`
    )).chain(AsyncResult.fromResponse)
  }

  const loadSettings  = async () => loadData(
    '/admin/settings', {}, (data) => setSettings(data.settings)
  )
  const loadExamTypes = async () => loadData(
    '/admin/crud/exam_types', {},
    (data) => setExamTypes(data.exam_types.map((etJSON: any) => ExamType.fromJSON(etJSON)))
  )
  const loadTimeSlots = async () => loadData(
    '/admin/crud/time_slots',
    { params: { 'with[]': 'exam_types' } },
    (data) => setTimeSlots(data.time_slots.map((tsJSON: any) => TimeSlot.fromJSON(tsJSON)))
  )

  async function submit(timeSlot: Entity): Promise<AsyncResult<null, string>> {
    let result;

    if (creating) {
      result = await createTimeSlot(timeSlot)

      result.onSuccess(async () => setCreating(false))
    } else {
      result = await updateTimeSlot(editedId as number, timeSlot);

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
        prompt={`Skutečně chcete smazat časový slot "${getDeletedSlot().name}"?`}
        onConfirm={async () => {
          const result = await deleteTimeSlot(deletedId);

          result.onSuccess(async     () => { setErrors([]); loadTimeSlots() });
          result.onFailure(async (data) => {
            setErrors([`Nemohu smazat časový slot: ${data.error}.`]);
          })

          setDeletedId(null);
        }}
        onCancel={ () => setDeletedId(null)}
      />}
    </Container>
  )
}

export default withRouter(TimeSlotManagement);
