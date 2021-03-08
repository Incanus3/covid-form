import { fullyLogIn                   } from './helpers/authentication'
import { dailyOverridesManagementLink } from './helpers/links'

context('Daily overrides management', () => {
  beforeEach(() => {
    fullyLogIn('test@test.cz', 'asdf')
  })

  it('it shows settings table', () => {
    dailyOverridesManagementLink().click({ force: true })

    cy.get('#settings-table').should('be.visible')
  })
})
