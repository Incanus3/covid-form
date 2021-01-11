import { administrationLink } from './links'

export function visit() {
  cy.visit('/')
  administrationLink().click()
}

export function logIn(email, password) {
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('#login-submit').click()
}

export function alert() {
  return cy.get('#login-alert')
}
