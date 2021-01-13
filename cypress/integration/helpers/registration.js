export function visit() {
  cy.visit('/')
}

export function fillForm({
  firstName = 'Testy', lastName  = 'Testson',
  municipality = 'Prague', zipCode = '10000',
  email = 'testy.testson@test.cz', phone = '602123456',
  insuranceNumber = null
} = {}) {
  insuranceNumber = insuranceNumber || generateInsuranceNumber()

  findAvailableExamDate().click()
  checkRequestFormCheckbox()

  cy.get('#first-name'      ).clear().type(firstName)
  cy.get('#last-name'       ).clear().type(lastName)
  cy.get('#municipality'    ).clear().type(municipality)
  cy.get('#zip-code'        ).clear().type(zipCode)
  cy.get('#email'           ).clear().type(email)
  cy.get('#phone'           ).clear().type(phone)
  cy.get('#insurance-number').clear().type(insuranceNumber)

  return { firstName, lastName, municipality, zipCode, email, phone, insuranceNumber }
}

export function submit() {
  submitButton().click()
}

export function reset() {
  cy.get('#covid-form-reset-button').click()
}

export function submitButton() {
  return cy.get('#covid-form-submit')
}

export function alert() {
  return cy.get('#covid-form-alert')
}

export function checkRequestFormCheckbox() {
  // may not be there, so we can't use cy.get()
  Cypress.$('#have-request-form .form-check-input').trigger('click')
}

const random = Cypress._.random

function generateInsuranceNumber() {
  const isMan = random(1)
  const base = (
    random(60, 99) * Math.pow(10, 8) +
    (isMan ? random(1, 12) : random(50, 62)) * Math.pow(10, 6) +
    random(1, 28) * Math.pow(10, 4) +
    random(9989)
  )

  return base + (11 - base % 11)
}

function findAvailableExamDate() {
  const selector = '.react-datepicker .react-datepicker__day:not(.react-datepicker__day--disabled)'

  return cy.get(selector).first()
}
