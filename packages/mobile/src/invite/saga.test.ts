import { CeloTxReceipt } from '@celo/connect'
import { CURRENCY_ENUM } from '@celo/utils'
import BigNumber from 'bignumber.js'
import { Linking, Platform, Share } from 'react-native'
import SendIntentAndroid from 'react-native-send-intent'
import SendSMS from 'react-native-sms'
import { expectSaga } from 'redux-saga-test-plan'
import * as matchers from 'redux-saga-test-plan/matchers'
import { throwError } from 'redux-saga-test-plan/providers'
import { call } from 'redux-saga/effects'
import { PincodeType } from 'src/account/reducer'
import { showError } from 'src/alert/actions'
import { ErrorMessages } from 'src/app/ErrorMessages'
import { WEB_LINK } from 'src/brandingConfig'
import { generateShortInviteLink } from 'src/firebase/dynamicLinks'
import { features } from 'src/flags'
import i18n from 'src/i18n'
import { updateE164PhoneNumberAddresses } from 'src/identity/actions'
import {
  InviteBy,
  redeemInvite,
  redeemInviteFailure,
  redeemInviteSuccess,
  sendInvite,
  SENTINEL_INVITE_COMMENT,
  storeInviteeData,
} from 'src/invite/actions'
import {
  generateInviteLink,
  initiateEscrowTransfer,
  moveAllFundsFromAccount,
  sendInvite as sendInviteSaga,
  watchRedeemInvite,
  watchSendInvite,
} from 'src/invite/saga'
import { getSendFee } from 'src/send/saga'
import { fetchDollarBalance, transferStableToken } from 'src/stableToken/actions'
import { transactionConfirmed } from 'src/transactions/actions'
import { waitForTransactionWithId } from 'src/transactions/saga'
import { getContractKitAsync } from 'src/web3/contracts'
import { getConnectedUnlockedAccount, getOrCreateAccount, waitWeb3LastBlock } from 'src/web3/saga'
import { createMockStore } from 'test/utils'
import { mockAccount, mockE164Number, mockInviteDetails } from 'test/values'

const mockKey = '0x1129eb2fbccdc663f4923a6495c35b096249812b589f7c4cd1dba01e1edaf724'

const mockReceipt: CeloTxReceipt = {
  status: true,
  transactionHash: '0x50194f663a5d590376366998b81a3ef38dbc506f88040e52e886389933384df1',
  transactionIndex: 0,
  blockHash: '0x3894884029bccc7e759a0e375731aca84623737c613c5c2e3990f959a0da4541',
  blockNumber: 4031079,
  from: '0xA76df5D1caE697479fA08Afa7b0D35E182e0137a',
  to: '0x471EcE3750Da237f93B8E339c536989b8978a438',
  cumulativeGasUsed: 31502,
  gasUsed: 31502,
  logs: [],
  logsBloom: '',
}

const TEST_FEE_INFO_CUSD = {
  fee: new BigNumber(10).pow(16),
  gas: new BigNumber(200000),
  gasPrice: new BigNumber(10).pow(9).times(5),
  currency: CURRENCY_ENUM.DOLLAR,
}

jest.mock('src/firebase/dynamicLinks', () => ({
  ...(jest.requireActual('src/firebase/dynamicLinks') as any),
  generateShortInviteLink: jest.fn(async () => 'http://celo.page.link/PARAMS'),
}))

jest.mock('src/account/actions', () => ({
  ...(jest.requireActual('src/account/actions') as any),
  getPincode: async () => 'pin',
}))

jest.mock('src/transactions/send', () => ({
  sendTransaction: async () => mockReceipt,
}))

jest.mock('src/config', () => {
  return {
    ...(jest.requireActual('src/config') as any),
    APP_STORE_ID: '1482389446',
    DYNAMIC_DOWNLOAD_LINK: 'http://celo.page.link/PARAMS',
  }
})

SendIntentAndroid.sendSms = jest.fn()
SendSMS.send = jest.fn()
Share.share = jest.fn()

const state = createMockStore({
  web3: { account: mockAccount },
  account: { pincodeType: PincodeType.CustomPin },
}).getState()

describe(watchSendInvite, () => {
  const komenciEnabled = features.KOMENCI

  beforeAll(() => {
    jest.useRealTimers()
    features.KOMENCI = false
  })

  afterAll(() => {
    features.KOMENCI = komenciEnabled
  })

  const dateNowStub = jest.fn(() => 1588200517518)
  global.Date.now = dateNowStub

  it.skip('sends an SMS invite on Android as expected', async () => {
    Platform.OS = 'android'
    await expectSaga(watchSendInvite)
      .provide([
        [call(waitWeb3LastBlock), true],
        [call(getConnectedUnlockedAccount), mockAccount],
        [matchers.call.fn(waitForTransactionWithId), 'a uuid'],
      ])
      .withState(state)
      .dispatch(sendInvite(mockInviteDetails.e164Number, InviteBy.SMS))
      .dispatch(transactionConfirmed('a uuid', mockReceipt))
      .put(
        transferStableToken({
          recipientAddress: mockAccount,
          amount: '0.30',
          comment: SENTINEL_INVITE_COMMENT,
          context: { id: 'a uuid' },
        })
      )
      .put(storeInviteeData(mockInviteDetails))
      .put(
        updateE164PhoneNumberAddresses(
          {},
          { [mockAccount.toLowerCase()]: mockInviteDetails.e164Number }
        )
      )
      .run()

    expect(SendIntentAndroid.sendSms).toHaveBeenCalled()
  })

  it.skip('sends an SMS invite on iOS as expected', async () => {
    Platform.OS = 'ios'
    await expectSaga(watchSendInvite)
      .provide([
        [call(waitWeb3LastBlock), true],
        [call(getConnectedUnlockedAccount), mockAccount],
        [matchers.call.fn(waitForTransactionWithId), 'a uuid'],
      ])
      .withState(state)
      .dispatch(sendInvite(mockInviteDetails.e164Number, InviteBy.SMS))
      .dispatch(transactionConfirmed('a uuid', mockReceipt))
      .put(
        transferStableToken({
          recipientAddress: mockAccount,
          amount: '0.30',
          comment: SENTINEL_INVITE_COMMENT,
          context: { id: 'a uuid' },
        })
      )
      .put(storeInviteeData(mockInviteDetails))
      .put(
        updateE164PhoneNumberAddresses(
          {},
          { [mockAccount.toLowerCase()]: mockInviteDetails.e164Number }
        )
      )
      .run()

    expect(SendSMS.send).toHaveBeenCalled()
  })

  it.skip('sends a WhatsApp invite on Android as expected', async () => {
    Platform.OS = 'android'
    await expectSaga(watchSendInvite)
      .provide([
        [call(waitWeb3LastBlock), true],
        [call(getConnectedUnlockedAccount), mockAccount],
        [matchers.call.fn(waitForTransactionWithId), 'a uuid'],
      ])
      .withState(state)
      .dispatch(sendInvite(mockInviteDetails.e164Number, InviteBy.WhatsApp))
      .dispatch(transactionConfirmed('a uuid', mockReceipt))
      .put(
        transferStableToken({
          recipientAddress: mockAccount,
          amount: '0.30',
          comment: SENTINEL_INVITE_COMMENT,
          context: { id: 'a uuid' },
        })
      )
      .put(storeInviteeData(mockInviteDetails))
      .run()

    expect(Linking.openURL).toHaveBeenCalled()
  })

  it.skip('sends a WhatsApp invite on iOS as expected', async () => {
    Platform.OS = 'ios'
    await expectSaga(watchSendInvite)
      .provide([
        [call(waitWeb3LastBlock), true],
        [call(getConnectedUnlockedAccount), mockAccount],
        [matchers.call.fn(waitForTransactionWithId), 'a uuid'],
      ])
      .withState(state)
      .dispatch(sendInvite(mockInviteDetails.e164Number, InviteBy.WhatsApp))
      .dispatch(transactionConfirmed('a uuid', mockReceipt))
      .put(
        transferStableToken({
          recipientAddress: mockAccount,
          amount: '0.30',
          comment: SENTINEL_INVITE_COMMENT,
          context: { id: 'a uuid' },
        })
      )
      .put(storeInviteeData(mockInviteDetails))
      .run()

    expect(Linking.openURL).toHaveBeenCalled()
  })
})

describe('watchSendInvite with Komenci enabled', () => {
  const komenciEnabled = features.KOMENCI
  const escrowWithoutCodeEnabled = features.ESCROW_WITHOUT_CODE
  const AMOUNT_TO_SEND = new BigNumber(10)

  beforeAll(() => {
    jest.useRealTimers()
    features.KOMENCI = true
    features.ESCROW_WITHOUT_CODE = true
  })

  afterAll(() => {
    features.KOMENCI = komenciEnabled
    features.ESCROW_WITHOUT_CODE = escrowWithoutCodeEnabled
  })

  const dateNowStub = jest.fn(() => 1588200517518)
  global.Date.now = dateNowStub

  it.skip('sends an invite as expected', async () => {
    i18n.t = jest.fn((key) => key)

    await expectSaga(watchSendInvite)
      .provide([
        [call(waitWeb3LastBlock), true],
        [call(getConnectedUnlockedAccount), mockAccount],
        [call(initiateEscrowTransfer, mockE164Number, AMOUNT_TO_SEND), undefined],
      ])
      .withState(state)
      .dispatch(
        sendInvite(mockInviteDetails.e164Number, InviteBy.SMS, AMOUNT_TO_SEND, CURRENCY_ENUM.DOLLAR)
      )
      .dispatch(transactionConfirmed('a uuid', mockReceipt))
      .run()

    expect(i18n.t).toHaveBeenCalledWith('sendFlow7:inviteWithEscrowedPayment', {
      amount: AMOUNT_TO_SEND.toString(),
      link: WEB_LINK,
    })
    expect(Share.share).toHaveBeenCalledWith({ message: 'sendFlow7:inviteWithEscrowedPayment' })
  })

  it('adds invitee details when sending invite', async () => {
    await expectSaga(
      sendInviteSaga,
      mockInviteDetails.e164Number,
      InviteBy.SMS,
      AMOUNT_TO_SEND,
      CURRENCY_ENUM.DOLLAR
    )
      .put(storeInviteeData(mockInviteDetails))
      .run()
  })
})

describe(watchRedeemInvite, () => {
  beforeAll(() => {
    jest.useRealTimers()
  })

  it('works with a valid private key and enough money on it', async () => {
    await expectSaga(watchRedeemInvite)
      .provide([
        [call(waitWeb3LastBlock), true],
        [call(getOrCreateAccount), mockAccount],
        [matchers.call.fn(getSendFee), TEST_FEE_INFO_CUSD],
      ])
      .withState(state)
      .dispatch(redeemInvite(mockKey))
      .put(fetchDollarBalance())
      .put(redeemInviteSuccess())
      .run()
  })

  it('fails with a valid private key but unsuccessful transfer', async () => {
    await expectSaga(watchRedeemInvite)
      .provide([
        [call(waitWeb3LastBlock), true],
        [call(getOrCreateAccount), mockAccount],
        [matchers.call.fn(moveAllFundsFromAccount), throwError(new Error('fake error'))],
      ])
      .withState(state)
      .dispatch(redeemInvite(mockKey))
      .put(showError(ErrorMessages.REDEEM_INVITE_FAILED))
      .put(redeemInviteFailure())
      .run()
  })

  it('fails with a valid private key but no money on key', async () => {
    const stableToken = await (await getContractKitAsync()).contracts.getStableToken()
    // @ts-ignore Jest Mock
    stableToken.balanceOf.mockResolvedValueOnce(new BigNumber(0))

    await expectSaga(watchRedeemInvite)
      .provide([
        [call(waitWeb3LastBlock), true],
        [call(getOrCreateAccount), mockAccount],
      ])
      .withState(state)
      .dispatch(redeemInvite(mockKey))
      .put(showError(ErrorMessages.EMPTY_INVITE_CODE))
      .put(redeemInviteFailure())
      .run()
  })

  it('fails with error creating account', async () => {
    await expectSaga(watchRedeemInvite)
      .provide([
        [call(waitWeb3LastBlock), true],
        [call(getOrCreateAccount), throwError(new Error('fake error'))],
      ])
      .withState(state)
      .dispatch(redeemInvite(mockKey))
      .put(showError(ErrorMessages.REDEEM_INVITE_FAILED))
      .put(redeemInviteFailure())
      .run()
  })
})

describe(generateInviteLink, () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('Generate invite link correctly', async () => {
    const result = await generateInviteLink(mockKey)
    expect(result).toBe('http://celo.page.link/PARAMS')
    expect(generateShortInviteLink).toBeCalledTimes(1)
    expect(generateShortInviteLink).toHaveBeenCalledWith({
      link: `https://valoraapp.com/?invite-code=${mockKey}`,
      appStoreId: '1482389446',
      bundleId: 'org.celo.mobile.alfajores',
    })
  })
})
