import _ from 'lodash';

import React, { useState, useEffect, useContext } from 'react';
import { withRouter                             } from 'react-router';
import { Container, Card                        } from 'react-bootstrap';

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

  async function loadData(path, options, successHandler) {
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history, 'GET', path, options))
      .onSuccess(async (response) => response.ok && successHandler(await response.json()))
  }

  async function updateTimeSlot(id, values) {
    const data = values.toJSON();

    data.exam_types = _.map(data.exam_types, 'id');

    // TODO: show success or error message
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history,
      'PUT', `/admin/crud/time_slots/${id}`, { data }
    )).onSuccess(async (response) => response.ok && console.log(await response.json()))
  }

  const loadSettings  = async () => loadData('/admin/settings', {},
    (data) => setSettings(data.settings))
  const loadExamTypes = async () => loadData('/admin/crud/exam_types', {},
    (data) => setExamTypes(data.exam_types.map((etJSON) => ExamType.fromJSON(etJSON))))
  const loadTimeSlots = async () => loadData('/admin/crud/time_slots',
    { params: { 'with[]': 'exam_types' } },
    (data) => setTimeSlots(data.time_slots.map((tsJSON) => TimeSlot.fromJSON(tsJSON))))

  async function submit(updatedTimeSlot) {
    await updateTimeSlot(editedId, updatedTimeSlot);

    setEditedId(null);

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
              edit={(timeSlot) => setEditedId(timeSlot.id)}
              timeSlots={timeSlots}
              dailyRegistrationLimit={settings.daily_registration_limit}
            />}
        </Card.Body>
      </Card>

      {editedId && <TimeSlotModal
        show={true}
        hide={() => setEditedId(null)}
        submit={submit}
        timeSlot={_.find(timeSlots, { id: editedId })}
        availableExamTypes={examTypes}
      />}
    </Container>
  )
}

export default withRouter(TimeSlotManagement);
