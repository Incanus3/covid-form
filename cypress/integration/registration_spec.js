import {
  visit, fillForm, submit, reset, alert, submitButton
} from './helpers/registration'

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

      submit()

      alert().should('contain', 'registrace byla úspěšná')
    })
  })

  context('when submitting the same data twice', () => {
    it('should show appropriate error message', () => {
      const data = fillForm()

      submit()

      alert().should('contain', 'registrace byla úspěšná')

      reset().then(() => {
        fillForm(data)

        submit()

        alert().should('contain', 'je již registrován')
      })
    })
  })
})
