const detox = require('detox')
import { setDemoMode } from './src/utils/utils'

beforeAll(async () => {
  // Install app if not present
  await device.installApp()
  await device.launchApp({
    newInstance: false,
    permissions: { notifications: 'YES', contacts: 'YES' },
  })
  await device.setURLBlacklist(['.*blockchain-api-dot-celo-mobile-alfajores.appspot.com.*'])
  await setDemoMode()
})
