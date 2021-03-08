import { Table                                 } from 'react-bootstrap';
import { BsPencilSquare, BsPlusSquare, BsTrash } from 'react-icons/bs';

import { formatDateHuman } from 'src/utils/generic';
import { WithTooltip     } from 'src/utils/components';

function DailyOverrideRow({ entity, edit, remove }) {
  return (
    <tr>
      <td>{formatDateHuman(entity.date) }</td>
      <td>{entity.registrationLimit}</td>
      <td className='actions-column'>
        <div className='d-inline'>
          <WithTooltip text='editovat'>
            <BsPencilSquare onClick={() => edit(entity)} className='mx-1' />
          </WithTooltip>

          <WithTooltip text='smazat'  >
            <BsTrash onClick={() => remove(entity)} className='mx-1' />
          </WithTooltip>
        </div>
      </td>
    </tr>
  )
}

export default function DailyOverridesTable({ entities, create, edit, remove }) {
  return (
    <Table responsive size='sm' id='time-slot-table'>
      <thead>
        <tr>
          <th>Datum         </th>
          <th>Denní kapacita</th>
          <th className='actions-column'>
            <WithTooltip text='vytvořit'><BsPlusSquare onClick={create} className='mx-1' /></WithTooltip>
          </th>
        </tr>
      </thead>

      <tbody>
        {entities.map((entity) =>
          <DailyOverrideRow key={entity.id} edit={edit} remove={remove} entity={entity} />
        )}
      </tbody>
    </Table>
  )
}
