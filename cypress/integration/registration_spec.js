import { visit, fillForm, submit, reset, alert, submitButton } from './helpers/registration'

context('Registration', () => {
  beforeEach(() => {
    visit()
  })

  context('with unfilled form', () => {
    it('should not enable submit button', () => {
      submitButton().should('not.be.enabled')
    })
  })

  context('with properly filled form', () => {
    it('succeeds', () => {
      fillForm()

      cy.intercept('POST', '/register').as('register')
      submit()
      cy.wait('@register')

      alert().should('contain', 'registrace byla úspěšná')
    })
  })

  context('when submitting the same data twice', () => {
    it('should show appropriate error message', () => {
      const data = fillForm()

      cy.intercept('POST', '/register').as('register')
      submit()
      cy.wait('@register')

      alert().should('contain', 'registrace byla úspěšná')

      reset()
      fillForm(data)

      cy.intercept('POST', '/register').as('register')
      submit()
      cy.wait('@register')

      alert().should('contain', 'je již registrován')
    })
  })
})
