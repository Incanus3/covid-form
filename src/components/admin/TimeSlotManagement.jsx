import _ from 'lodash';

import React, { useState, useEffect, useContext } from 'react';
import { withRouter                             } from 'react-router';
import { Container, Card, Table                 } from 'react-bootstrap';
import { BsPencilSquare                         } from 'react-icons/bs';

import { AuthContext } from 'src/auth';
import { WithTooltip } from 'src/utils/components';

function TimeSlotRow({ timeSlot, coefficientMultiplier }) {
  const slotCapacity = coefficientMultiplier * timeSlot.limit_coefficient;

  return (
    <tr>
      <td>{timeSlot.name             }</td>
      <td>{timeSlot.start_time       }</td>
      <td>{timeSlot.end_time         }</td>
      <td>{timeSlot.limit_coefficient}</td>
      <td>{slotCapacity              }</td>
      <td><WithTooltip text='editovat'><BsPencilSquare /></WithTooltip></td>
    </tr>
  )
}

function TimeSlotTable({ timeSlots, dailyRegistrationLimit }) {
  const coefficientSum        = _.sum(_.map(timeSlots, 'limit_coefficient'));
  const coefficientMultiplier = _.round(dailyRegistrationLimit / coefficientSum);

  return (
    <Table responsive size='sm' id='time-slot-table'>
      <thead>
        <tr>
          <th>Název              </th>
          <th>Od                 </th>
          <th>Do                 </th>
          <th>Koeficient kapacity</th>
          <th>Vypočtená kapacita </th>
          <th>Akce               </th>
        </tr>
      </thead>

      <tbody>
        {timeSlots.map((timeSlot) =>
          <TimeSlotRow
            key={timeSlot.id}
            timeSlot={timeSlot}
            coefficientMultiplier={coefficientMultiplier}
          />
        )}
      </tbody>
    </Table>
  )
}

function TimeSlotManagement({ history }) {
  const auth = useContext(AuthContext)

  const [settings,  setSettings ] = useState(null);
  const [timeSlots, setTimeSlots] = useState(null);

  async function loadData(path, setter) {
    (await auth.authenticatedRequestWithLogoutWhenSessionExpired(history, 'GET', path))
      .onSuccess(async (response) => response.ok && setter(await response.json()))
  }

  useEffect(() => {
    loadData('/admin/settings',        (data) => setSettings(data.settings))
    loadData('/admin/crud/time_slots', (data) => setTimeSlots(data.time_slots))
    // eslint-disable-next-line
  }, [])

  return (
    <Container>
      <Card id='time-slot-management-card'>
        <Card.Header>Nastavení časových slotů</Card.Header>

        <Card.Body>
          {settings && timeSlots &&
            <TimeSlotTable
              timeSlots={timeSlots}
              dailyRegistrationLimit={settings.daily_registration_limit}
            />}
        </Card.Body>
      </Card>
    </Container>
  )
}

export default withRouter(TimeSlotManagement);
