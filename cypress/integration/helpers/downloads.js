export function disableDownloadPrompts() {
  // The next command allow downloads in Electron, Chrome, and Edge
  // without any users popups or file save dialogs.
  if (!Cypress.isBrowser('firefox')) {
    // since this call returns a promise, must tell Cypress to wait
    // for it to be resolved
    cy.log('Page.setDownloadBehavior')
    cy.wrap(
      Cypress.automation('remote:debugger:protocol',
        {
          command: 'Page.setDownloadBehavior',
          params: { behavior: 'allow', downloadPath: 'cypress/downloads' },
        }),
      { log: false }
    )
  }
}
