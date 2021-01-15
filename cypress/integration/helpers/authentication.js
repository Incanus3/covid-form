import { administrationLink, logoutLink } from './links'

export function visit() {
  cy.visit('/')
  administrationLink().click({ force: true })
}

export function logIn(email, password) {
  cy.get('#email').type(email)
  cy.get('#password').type(password)
  cy.get('#login-submit').click()
}

export function fullyLogIn(...args) {
  visit()
  logIn(...args)
  logoutLink().should('exist')
}

export function alert() {
  return cy.get('#login-alert')
}
