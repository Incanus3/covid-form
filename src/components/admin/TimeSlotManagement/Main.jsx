import _ from 'lodash';

import React, { useState, useEffect, useContext } from 'react';
import { withRouter                             } from 'react-router';
import { Container, Card                        } from 'react-bootstrap';

import { ConfirmModal       } from 'src/utils/components';
import { AuthContext        } from 'src/auth';
import { ExamType, TimeSlot } from 'src/models';

import TimeSlotModal from './Modal'
import TimeSlotTable from './Table'

function TimeSlotManagement({ history }) {
  const auth = useContext(AuthContext)

  const [settings,  setSettings ] = useState(null);
  const [examTypes, setExamTypes] = useState(null);
  const [timeSlots, setTimeSlots] = useState(null);
  const [editedId,  setEditedId ] = useState(null);
  const [deletedId, setDeletedId] = useState(null);
  const [creating,  setCreating ] = useState(false);

  async function loadData(path, options, successHandler) {
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history, 'GET', path, options))
      .onSuccess(async (response) => response.ok && successHandler(await response.json()))
  }

  async function createTimeSlot(values) {
    const data = values.toJSON();

    data.exam_types = _.map(data.exam_types, 'id');

    // TODO: show success or error message
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
      'POST', '/admin/crud/time_slots', { data }
    )).onSuccess(async (response) => response.ok && console.log(await response.json()))
  }

  async function updateTimeSlot(id, values) {
    const data = values.toJSON();

    data.exam_types = _.map(data.exam_types, 'id');

    // TODO: show success or error message
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
      'PUT', `/admin/crud/time_slots/${id}`, { data }
    )).onSuccess(async (response) => response.ok && console.log(await response.json()))
  }

  async function deleteTimeSlot(id) {
    // TODO: show success or error message
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
      'DELETE', `/admin/crud/time_slots/${id}`
    )).onSuccess(async (response) => response.ok && console.log(response))
  }

  const loadSettings  = async () => loadData('/admin/settings', {},
    (data) => setSettings(data.settings))
  const loadExamTypes = async () => loadData('/admin/crud/exam_types', {},
    (data) => setExamTypes(data.exam_types.map((etJSON) => ExamType.fromJSON(etJSON))))
  const loadTimeSlots = async () => loadData('/admin/crud/time_slots',
    { params: { 'with[]': 'exam_types' } },
    (data) => setTimeSlots(data.time_slots.map((tsJSON) => TimeSlot.fromJSON(tsJSON))))

  async function submit(timeSlot) {
    if (creating) {
      await createTimeSlot(timeSlot);

      setCreating(false);
    } else {
      await updateTimeSlot(editedId, timeSlot);

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
              edit={  (timeSlot) => setEditedId( timeSlot.id)}
              remove={(timeSlot) => setDeletedId(timeSlot.id)}
              timeSlots={timeSlots}
              dailyRegistrationLimit={settings.daily_registration_limit}
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
        prompt={`Skutečně chcete smazat časový slot "${_.find(timeSlots, { id: deletedId }).name}"?`}
        onConfirm={() => deleteTimeSlot(deletedId).then(() => {
          setDeletedId(null); loadTimeSlots()
        }) }
        onCancel={ () => setDeletedId(null)}
      />}
    </Container>
  )
}

export default withRouter(TimeSlotManagement);
