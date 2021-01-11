import { logoutLink             } from './helpers/links'
import { disableDownloadPrompts } from './helpers/downloads'
import { visit, logIn, alert    } from './helpers/authentication'

context('Admin login', () => {
  beforeEach(() => {
    visit()
  })

  context('when logged out', () => {
    context('with correct credentials', () => {
      it('succeeds', () => {
        logIn('test@test.cz', 'asdf')

        logoutLink().should('exist')
      })
    })

    context('with bad credentials', () => {
      it('succeeds', () => {
        logIn('test@test.cz', 'bad')

        alert().should('contain', 'Přihlášení selhalo')
      })
    })

    it('does not allow user to visit logged-in routes', () => {
      cy.visit('/admin/export')
      cy.location('pathname').should('eq', '/admin/login')
    })
  })

  context('when logged in', () => {
    beforeEach(() => {
      cy.task('clearDownloads')
      disableDownloadPrompts()

      logIn('test@test.cz', 'asdf')
    })

    it('it allows user to get CSV export immediately', () => {
      cy.intercept('GET', '/admin/export', 'foo').as('export')

      cy.get('#csv-export-button').click()

      cy.wait('@export')
    })

    it('it allows user to get CSV export while refresh token active', () => {
      let counter = 0

      cy.intercept('GET', '/admin/export', (req) => {
        counter += 1
        req.alias = `export-${counter}`
      })
      cy.intercept('POST', '/auth/refresh_token').as('refresh-token')

      cy.wait(1500)
      cy.get('#csv-export-button').click()

      cy.wait('@export-1')
      cy.wait('@refresh-token')
      cy.wait('@export-2')
    })

    it('it logs user out when trying to get CSV export after refresh token expired', () => {
      cy.wait(2500)
      cy.get('#csv-export-button').click()

      cy.location('pathname').should('eq', '/admin/login')
      alert().should('contain', 'Platnost Vašeho přihlášení vypršela')
    })
  })
})
