import _ from 'lodash';

import { Table          } from 'react-bootstrap';
import { BsPencilSquare } from 'react-icons/bs';
import { WithTooltip    } from 'src/utils/components';

function TimeSlotRow({ timeSlot, coefficientMultiplier, edit }) {
  const slotCapacity = _.round(coefficientMultiplier * timeSlot.limitCoefficient);
  const examTypes    = _.join(_.map(timeSlot.examTypes, 'id'), ', ');

  return (
    <tr>
      <td>{timeSlot.name              }</td>
      <td>{timeSlot.formattedStartTime}</td>
      <td>{timeSlot.formattedEndTime  }</td>
      <td>{timeSlot.limitCoefficient  }</td>
      <td>{slotCapacity               }</td>
      <td>{examTypes                  }</td>
      <td>
        <WithTooltip text='editovat'><BsPencilSquare onClick={() => edit(timeSlot)} /></WithTooltip>
      </td>
    </tr>
  )
}

export default function TimeSlotTable({ timeSlots, dailyRegistrationLimit, edit }) {
  const coefficientSum        = _.sum(_.map(timeSlots, 'limitCoefficient'));
  const coefficientMultiplier = dailyRegistrationLimit / coefficientSum;

  return (
    <Table responsive size='sm' id='time-slot-table'>
      <thead>
        <tr>
          <th>Název                  </th>
          <th>Od                     </th>
          <th>Do                     </th>
          <th>Koeficient kapacity    </th>
          <th>Vypočtená kapacita     </th>
          <th>Povolené typy vyšetření</th>
          <th>Akce                   </th>
        </tr>
      </thead>

      <tbody>
        {timeSlots.map((timeSlot) =>
          <TimeSlotRow
            key={timeSlot.id}
            edit={edit}
            timeSlot={timeSlot}
            coefficientMultiplier={coefficientMultiplier}
          />
        )}
      </tbody>
    </Table>
  )
}

