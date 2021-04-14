import { Address } from '@celo/base'
import { OdisUtils } from '@celo/identity'
import {
  BIDALI_URL,
  DEFAULT_SYNC_MODE,
  DEFAULT_TESTNET,
  FORNO_ENABLED_INITIALLY,
  GETH_USE_FULL_NODE_DISCOVERY,
  GETH_USE_STATIC_NODES,
  MOONPAY_API_KEY,
  RECAPTCHA_SITE_KEY,
  SIMPLEX_API_KEY,
} from 'src/config'
import { GethSyncMode } from 'src/geth/consts'
import Logger from 'src/utils/Logger'

export enum Testnets {
  alfajores = 'alfajores',
  mainnet = 'mainnet',
}

interface NetworkConfig {
  nodeDir: string
  syncMode: GethSyncMode
  initiallyForno: boolean
  blockchainApiUrl: string
  odisUrl: string // Phone Number Privacy service url
  odisPubKey: string
  moonpayWidgetUrl: string
  moonpayApiUrl: string
  moonpayApiKey: string
  signMoonpayUrl: string
  rampWidgetUrl: string
  transakWidgetUrl: string
  transakApiUrl: string
  useDiscovery: boolean
  useStaticNodes: boolean
  komenciUrl: string
  allowedMtwImplementations: string[]
  currentMtwImplementationAddress: string
  recaptchaSiteKey: string
  bidaliUrl: string
  simplexApiKey: string
  simplexApiUrl: string
  komenciLoadCheckEndpoint: string
}

const moonpayWidgetStaging = 'https://buy-staging.moonpay.io/'
const moonpayWidgetProd = 'https://buy.moonpay.io/'
const moonpayApiStaging = 'https://api.moonpay.com/v3'
const moonpayApiProd = 'https://api.moonpay.com/v3'

const signMoonpayUrlStaging =
  'https://us-central1-celo-testnet-production.cloudfunctions.net/signMoonpayStaging'
const signMoonpayUrlProd =
  'https://us-central1-celo-mobile-mainnet.cloudfunctions.net/signMoonpayProd'

const rampWidgetStaging = 'https://ri-widget-staging.firebaseapp.com'
const rampWidgetProd = 'https://buy.ramp.network'

const transakWidgetProd = 'https://global.transak.com'
const transakWidgetStaging = 'https://staging-global.transak.com'
const transakApiProd = ''
const transakApiStaging = 'https://staging-api.transak.com/api/v2'

// const SIMPLEX_API_URL_STAGING =
//   'https://us-central1-celo-mobile-alfajores.cloudfunctions.net/processSimplexRequest'
// const SIMPLEX_API_URL_PROD =
//   'https://us-central1-celo-mobile-mainnet.cloudfunctions.net/processSimplexRequest'
const SIMPLEX_API_URL_STAGING = 'https://api.sandbox.test-simplexcc.com'
const SIMPLEX_API_URL_PROD = 'https://api.simplexcc.com'

const KOMENCI_URL_MAINNET = 'https://mainnet-komenci.azurefd.net'
const KOMENCI_URL_STAGING = 'https://staging-komenci.azurefd.net'

const ALLOWED_MTW_IMPLEMENTATIONS_MAINNET: Address[] = [
  '0x6511FB5DBfe95859d8759AdAd5503D656E2555d7',
]
const ALLOWED_MTW_IMPLEMENTATIONS_STAGING: Address[] = [
  '0x5C9a6E3c3E862eD306E2E3348EBC8b8310A99e5A',
  '0x88a2b9B8387A1823D821E406b4e951337fa1D46D',
]

const CURRENT_MTW_IMPLEMENTATION_ADDRESS_MAINNET: Address =
  '0x6511FB5DBfe95859d8759AdAd5503D656E2555d7'
const CURRENT_MTW_IMPLEMENTATION_ADDRESS_STAGING: Address =
  '0x5C9a6E3c3E862eD306E2E3348EBC8b8310A99e5A'

const KOMENCI_LOAD_CHECK_ENDPOINT_STAGING = 'https://staging-komenci.azurefd.net/v1/ready'
const KOMENCI_LOAD_CHECK_ENDPOINT_PROD = 'https://mainnet-komenci.azurefd.net/v1/ready'

const networkConfigs: { [testnet: string]: NetworkConfig } = {
  [Testnets.alfajores]: {
    nodeDir: `.${Testnets.alfajores}`,
    syncMode: DEFAULT_SYNC_MODE,
    initiallyForno: FORNO_ENABLED_INITIALLY,
    blockchainApiUrl: 'https://blockchain-api-dot-celo-mobile-alfajores.appspot.com/',
    odisUrl: OdisUtils.Query.ODIS_ALFAJORES_CONTEXT.odisUrl,
    odisPubKey: OdisUtils.Query.ODIS_ALFAJORES_CONTEXT.odisPubKey,
    moonpayWidgetUrl: moonpayWidgetStaging,
    moonpayApiUrl: moonpayApiStaging,
    moonpayApiKey: MOONPAY_API_KEY,
    signMoonpayUrl: signMoonpayUrlStaging,
    rampWidgetUrl: rampWidgetStaging,
    transakWidgetUrl: transakWidgetStaging,
    transakApiUrl: transakApiStaging,
    useDiscovery: GETH_USE_FULL_NODE_DISCOVERY,
    useStaticNodes: GETH_USE_STATIC_NODES,
    komenciUrl: KOMENCI_URL_STAGING,
    allowedMtwImplementations: ALLOWED_MTW_IMPLEMENTATIONS_STAGING,
    currentMtwImplementationAddress: CURRENT_MTW_IMPLEMENTATION_ADDRESS_STAGING,
    recaptchaSiteKey: RECAPTCHA_SITE_KEY,
    bidaliUrl: BIDALI_URL,
    simplexApiUrl: SIMPLEX_API_URL_STAGING,
    simplexApiKey: SIMPLEX_API_KEY,
    komenciLoadCheckEndpoint: KOMENCI_LOAD_CHECK_ENDPOINT_STAGING,
  },
  [Testnets.mainnet]: {
    nodeDir: `.${Testnets.mainnet}`,
    syncMode: DEFAULT_SYNC_MODE,
    initiallyForno: FORNO_ENABLED_INITIALLY,
    blockchainApiUrl: 'https://blockchain-api-dot-celo-mobile-mainnet.appspot.com/',
    odisUrl: OdisUtils.Query.ODIS_MAINNET_CONTEXT.odisUrl,
    odisPubKey: OdisUtils.Query.ODIS_MAINNET_CONTEXT.odisPubKey,
    moonpayWidgetUrl: moonpayWidgetProd,
    moonpayApiUrl: moonpayApiProd,
    moonpayApiKey: MOONPAY_API_KEY,
    signMoonpayUrl: signMoonpayUrlProd,
    rampWidgetUrl: rampWidgetProd,
    transakWidgetUrl: transakWidgetProd,
    transakApiUrl: transakApiProd,
    useDiscovery: GETH_USE_FULL_NODE_DISCOVERY,
    useStaticNodes: GETH_USE_STATIC_NODES,
    komenciUrl: KOMENCI_URL_MAINNET,
    allowedMtwImplementations: ALLOWED_MTW_IMPLEMENTATIONS_MAINNET,
    currentMtwImplementationAddress: CURRENT_MTW_IMPLEMENTATION_ADDRESS_MAINNET,
    recaptchaSiteKey: RECAPTCHA_SITE_KEY,
    bidaliUrl: BIDALI_URL,
    simplexApiUrl: SIMPLEX_API_URL_PROD,
    simplexApiKey: SIMPLEX_API_KEY,
    komenciLoadCheckEndpoint: KOMENCI_LOAD_CHECK_ENDPOINT_PROD,
  },
}

Logger.info('Connecting to testnet: ', DEFAULT_TESTNET)

export default networkConfigs[DEFAULT_TESTNET]
