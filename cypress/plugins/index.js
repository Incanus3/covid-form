/// <reference types="cypress" />
/* eslint-disable no-console */
const path = require('path')
const fs = require('fs')

// place downloads into "cypress/downloads" folder
const downloadDirectory = path.join(__dirname, '..', 'downloads')
const isFirefox = (browser) => browser.family === 'firefox'

module.exports = (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  // register utility tasks to clear the downloads folder
  on('task', {
    clearDownloads () {
      // console.log('clearing folder %s', downloadDirectory)

      fs.rmdirSync(downloadDirectory, { recursive: true })

      return null
    },
  })

  // https://on.cypress.io/browser-launch-api
  on('before:browser:launch', (browser, options) => {
    // console.log('browser %o', browser)

    if (isFirefox(browser)) {
      // special settings for Firefox browser
      // to prevent showing popup dialogs that block the rest of the test
      options.preferences['browser.download.dir'] = downloadDirectory
      options.preferences['browser.download.folderList'] = 2

      // needed to prevent the download prompt for CSV files
      // TIP: with Firefox DevTools open, download the file yourself
      // and observe the reported MIME type in the Developer Tools
      const mimeTypes = ['text/csv']

      options.preferences['browser.helperApps.neverAsk.saveToDisk'] = mimeTypes.join(',')

      return options
    }

    // note: we set the download folder in Chrome-based browsers
    // from the spec itself using automation API
  })
}
