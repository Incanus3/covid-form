import { fullyLogIn             } from './helpers/authentication'
import { settingsManagementLink } from './helpers/links'

context('Settings management', () => {
  beforeEach(() => {
    fullyLogIn('test@test.cz', 'asdf')
  })

  it('it shows settings table', () => {
    settingsManagementLink().click({ force: true })

    cy.get('#settings-table').should('be.visible')
  })
})
