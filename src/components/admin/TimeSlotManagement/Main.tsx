import _ from 'lodash';

import React, { useState, useEffect, useContext } from 'react';
import { withRouter, RouteComponentProps        } from 'react-router-dom';
import { Container, Card                        } from 'react-bootstrap';

import { ConfirmModal                      } from 'src/utils/components';
import { ExamType, TimeSlot                } from 'src/models';
import { Auth, AuthContext, RequestOptions } from 'src/auth';

import TimeSlotModal from './Modal'
import TimeSlotTable from './Table'

type Entity = Record<string, any>;

function TimeSlotManagement({ history }: RouteComponentProps) {
  const auth = useContext<Auth | null>(AuthContext) as Auth;

  const [settings,  setSettings ] = useState<Entity   | null>(null);
  const [examTypes, setExamTypes] = useState<Entity[] | null>(null);
  const [timeSlots, setTimeSlots] = useState<Entity[] | null>(null);
  const [editedId,  setEditedId ] = useState<number   | null>(null);
  const [deletedId, setDeletedId] = useState<number   | null>(null);
  const [creating,  setCreating ] = useState<boolean>(false);

  function getDeletedSlot(): Entity { return _.find(timeSlots, { id: deletedId }) as Entity }

  async function loadData(
    path: string, options: RequestOptions, successHandler: (data: any) => void
  ) {
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history, 'GET', path, options))
      .onSuccess(async (response) => response.ok && successHandler(await response.json()))
  }

  async function createTimeSlot(values: Entity) {
    const data = values.toJSON();

    data.exam_types = _.map(data.exam_types, 'id');

    // TODO: show success or error message
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
      'POST', '/admin/crud/time_slots', { data }
    )).onSuccess(async (response) => response.ok && console.log(await response.json()))
  }

  async function updateTimeSlot(id: number, values: Entity) {
    const data = values.toJSON();

    data.exam_types = _.map(data.exam_types, 'id');

    // TODO: show success or error message
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
      'PUT', `/admin/crud/time_slots/${id}`, { data }
    )).onSuccess(async (response) => response.ok && console.log(await response.json()))
  }

  async function deleteTimeSlot(id: number) {
    // TODO: show success or error message
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
      'DELETE', `/admin/crud/time_slots/${id}`
    )).onSuccess(async (response) => response.ok && console.log(response))
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

  async function submit(timeSlot: Entity) {
    if (creating) {
      await createTimeSlot(timeSlot);

      setCreating(false);
    } else {
      await updateTimeSlot(editedId as number, timeSlot);

      setEditedId(null);
    }

    loadTimeSlots();
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
        onConfirm={() => deleteTimeSlot(deletedId).then(() => {
          setDeletedId(null); loadTimeSlots()
        }) }
        onCancel={ () => setDeletedId(null)}
      />}
    </Container>
  )
}

export default withRouter(TimeSlotManagement);
