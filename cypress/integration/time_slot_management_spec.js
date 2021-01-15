import { fullyLogIn }             from './helpers/authentication'
import { timeSlotManagementLink } from './helpers/links'

context('Time slot management', () => {
  beforeEach(() => {
    fullyLogIn('test@test.cz', 'asdf')
  })

  it('it shows time slot table', () => {
    timeSlotManagementLink().click({ force: true })

    cy.get('#time-slot-table').should('be.visible')
  })
})
