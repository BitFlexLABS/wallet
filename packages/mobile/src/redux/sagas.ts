import { sleep } from '@celo/utils/lib/async'
import { AnyAction } from 'redux'
import { call, spawn, takeEvery } from 'redux-saga/effects'
import { accountSaga } from 'src/account/saga'
import { appInit, appRemoteFeatureFlagSaga, appSaga, appVersionSaga } from 'src/app/saga'
import { dappKitSaga } from 'src/dappkit/dappkit'
import { escrowSaga } from 'src/escrow/saga'
import { exchangeSaga } from 'src/exchange/saga'
import { feesSaga } from 'src/fees/saga'
import { fiatExchangesSaga } from 'src/fiatExchanges/saga'
import { firebaseSaga } from 'src/firebase/saga'
import { gethSaga } from 'src/geth/saga'
import { goldTokenSaga } from 'src/goldToken/saga'
import { homeSaga } from 'src/home/saga'
import { identitySaga } from 'src/identity/saga'
import { importSaga } from 'src/import/saga'
import { inviteSaga } from 'src/invite/saga'
import { localCurrencySaga } from 'src/localCurrency/saga'
import { networkInfoSaga } from 'src/networkInfo/saga'
import { paymentRequestSaga } from 'src/paymentRequest/saga'
import { waitForRehydrate } from 'src/redux/persist-helper'
import { sendSaga } from 'src/send/saga'
// import { sentrySaga } from 'src/sentry/saga'
import { stableTokenSaga } from 'src/stableToken/saga'
import { transactionSaga } from 'src/transactions/saga'
import { checkAccountExistenceSaga } from 'src/utils/accountChecker'
import Logger from 'src/utils/Logger'
import { verifySaga } from 'src/verify/saga'
import { walletConnectSaga } from 'src/walletConnect/saga'
import { web3Saga } from 'src/web3/saga'

const loggerBlacklist = [
  'persist/REHYDRATE',
  'GETH_NEW_BLOCK',
  'APP/SET_GETH_CONNECTED',
  'ACCOUNT/SET_PHONE_NUMBER',
  'ACCOUNT/SET_PINCODE',
  'SEND/SET_RECIPIENT_CACHE',
  'SEND/STORE_LATEST_IN_RECENTS',
  'IMPORT/IMPORT_BACKUP_PHRASE',
  'WEB3/SET_DATA_ENCRYPTION_KEY',
  'INVITE/REDEEM_INVITE',
  'INVITE/STORE_INVITEE_DATA',
  'EXCHANGE/UPDATE_CELO_GOLD_EXCHANGE_RATE_HISTORY', // Not private, just noisy
  'TRANSACTIONS/NEW_TRANSACTIONS_IN_FEED',
]

function* loggerSaga() {
  // const devModeActive = yield select(devModeSelector)
  // if (!devModeActive) {
  //   return
  // }

  yield takeEvery('*', (action: AnyAction) => {
    if (
      action?.type &&
      (action.type.includes('IDENTITY/') || loggerBlacklist.includes(action.type))
    ) {
      // Log only action type, but not the payload as it can have
      // sensitive information. Excluding all IDENTITY/ actions because high likelyhood
      // they contain PII and the blacklist may get out of date.
      Logger.debug('redux/saga@logger', `${action.type} (payload not logged)`)
      return
    }
    try {
      Logger.debug('redux/saga@logger', JSON.stringify(action))
    } catch (err) {
      Logger.warn('redux/saga@logger', 'could not log action of type', action.type)
    }
  })
}

let sagasFinishedLoading = false
export async function waitUntilSagasFinishLoading() {
  while (!sagasFinishedLoading) {
    await sleep(100)
  }
}

export function* rootSaga() {
  try {
    // Delay all sagas until rehydrate is done
    // This prevents them from running with missing state
    yield call(waitForRehydrate)
    yield call(appInit)

    // Note, the order of these does matter in certain cases
    yield spawn(appVersionSaga)
    yield spawn(appRemoteFeatureFlagSaga)
    yield spawn(loggerSaga)
    yield spawn(appSaga)
    // yield spawn(sentrySaga)
    yield spawn(networkInfoSaga)
    yield spawn(gethSaga)
    yield spawn(web3Saga)
    yield spawn(accountSaga)
    yield spawn(firebaseSaga)
    yield spawn(transactionSaga)
    yield spawn(homeSaga)
    yield spawn(identitySaga)
    yield spawn(verifySaga)
    yield spawn(localCurrencySaga)
    yield spawn(feesSaga)
    yield spawn(stableTokenSaga)
    yield spawn(goldTokenSaga)
    yield spawn(sendSaga)
    yield spawn(exchangeSaga)
    yield spawn(paymentRequestSaga)
    yield spawn(escrowSaga)
    yield spawn(inviteSaga)
    yield spawn(importSaga)
    yield spawn(dappKitSaga)
    yield spawn(checkAccountExistenceSaga)
    yield spawn(fiatExchangesSaga)
    yield spawn(walletConnectSaga)
  } catch (error) {
    Logger.error('@rootSaga', 'Error while initializing sagas', error)
    // Propagate so it's handled by Sentry
    throw error
  } finally {
    sagasFinishedLoading = true
  }
}
