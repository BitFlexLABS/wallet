import { Actions as AppActions, UpdateFeatureFlagsAction } from 'src/app/actions'
import { areRecipientsEquivalent, Recipient } from 'src/recipients/recipient'
import { getRehydratePayload, REHYDRATE, RehydrateAction } from 'src/redux/persist-helper'
import { Actions, ActionTypes } from 'src/send/actions'
import { timeDeltaInHours } from 'src/utils/time'

// Sets the limit of recent recipients we want to store
const RECENT_RECIPIENTS_TO_STORE = 8

// We need to know the last 24 hours of payments (for compliance reasons)
export interface PaymentInfo {
  timestamp: number
  amount: number
}

export interface State {
  isSending: boolean
  recentRecipients: Recipient[]
  // Keep a list of recent (last 24 hours) payments
  recentPayments: PaymentInfo[]
  inviteRewardsEnabled: boolean
  inviteRewardCusd: number
  inviteRewardWeeklyLimit: number
  showSendToAddressWarning: boolean
}

const initialState = {
  isSending: false,
  recentRecipients: [],
  recentPayments: [],
  inviteRewardsEnabled: false,
  inviteRewardCusd: 0,
  inviteRewardWeeklyLimit: 0,
  showSendToAddressWarning: true,
}

export const sendReducer = (
  state: State | undefined = initialState,
  action: ActionTypes | RehydrateAction | UpdateFeatureFlagsAction
) => {
  switch (action.type) {
    case REHYDRATE: {
      // Ignore some persisted properties
      return {
        ...state,
        ...getRehydratePayload(action, 'send'),
        isSending: false,
        recipientCache: {},
      }
    }
    case Actions.SEND_PAYMENT_OR_INVITE:
      return {
        ...storeLatestRecentReducer(state, action.recipient),
        isSending: true,
      }
    case Actions.SEND_PAYMENT_OR_INVITE_SUCCESS:
      const now = Date.now()
      // Keep only the last 24 hours
      const paymentsLast24Hours = state.recentPayments.filter(
        (p: PaymentInfo) => timeDeltaInHours(now, p.timestamp) < 24
      )
      const latestPayment: PaymentInfo = { amount: action.amount.toNumber(), timestamp: now }
      return {
        ...state,
        isSending: false,
        recentPayments: [...paymentsLast24Hours, latestPayment],
      }
    case Actions.SEND_PAYMENT_OR_INVITE_FAILURE:
      return {
        ...state,
        isSending: false,
      }
    case AppActions.UPDATE_FEATURE_FLAGS:
      return {
        ...state,
        inviteRewardsEnabled: action.flags.inviteRewardsEnabled,
        inviteRewardCusd: action.flags.inviteRewardCusd,
        inviteRewardWeeklyLimit: action.flags.inviteRewardWeeklyLimit,
      }
    case Actions.SET_SHOW_WARNING:
      return {
        ...state,
        showSendToAddressWarning: action.showWarning,
      }
    default:
      return state
  }
}

const storeLatestRecentReducer = (state: State, newRecipient: Recipient) => {
  const recentRecipients = [
    newRecipient,
    ...state.recentRecipients.filter(
      (existingRecipient) => !areRecipientsEquivalent(newRecipient, existingRecipient)
    ),
  ].slice(0, RECENT_RECIPIENTS_TO_STORE)

  return {
    ...state,
    recentRecipients,
  }
}
