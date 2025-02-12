import { BtnTypes } from '@celo/react-components/components/Button'
import colors from '@celo/react-components/styles/colors'
import progressDots from '@celo/react-components/styles/progressDots'
import { Spacing } from '@celo/react-components/styles/styles'
import { useHeaderHeight } from '@react-navigation/stack'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet } from 'react-native'
import Education, { EducationTopic } from 'src/account/Education'
import { OnboardingEvents } from 'src/analytics/Events'
import ValoraAnalytics from 'src/analytics/ValoraAnalytics'
import { Namespaces } from 'src/i18n'
import Logo, { LogoTypes } from 'src/icons/Logo'
import { nuxNavigationOptions } from 'src/navigator/Headers'
import { navigate } from 'src/navigator/NavigationService'
import { Screens } from 'src/navigator/Screens'
import LanguageButton from 'src/onboarding/LanguageButton'

function useStep() {
  const { t } = useTranslation(Namespaces.onboarding)

  return React.useMemo(() => {
    return [
      {
        title: t('education.step1'),
        isTopTitle: true,
        image: require('src/images/onboarding-education-1.png'),
        topic: EducationTopic.onboarding,
      },
      {
        title: t('education.step2'),
        isTopTitle: true,
        image: require('src/images/onboarding-education-2.png'),
        topic: EducationTopic.onboarding,
      },
      {
        title: t('education.step3'),
        isTopTitle: true,
        image: require('src/images/onboarding-education-3.png'),
        topic: EducationTopic.onboarding,
      },
    ]
  }, [t])
}

export default function OnboardingEducationScreen() {
  const { t } = useTranslation(Namespaces.global)

  const headerHeight = useHeaderHeight()
  const stepInfo = useStep()

  useEffect(() => {
    ValoraAnalytics.track(OnboardingEvents.onboarding_education_start)
  }, [])

  const onFinish = () => {
    ValoraAnalytics.track(OnboardingEvents.onboarding_education_complete)
    navigate(Screens.Welcome)
  }

  return (
    <Education
      style={[styles.container, headerHeight ? { paddingTop: headerHeight } : undefined]}
      edges={['bottom']}
      embeddedNavBar={null}
      stepInfo={stepInfo}
      finalButtonType={BtnTypes.ONBOARDING}
      finalButtonText={t('global:getStarted')}
      buttonType={BtnTypes.ONBOARDING_SECONDARY}
      buttonText={t('global:next')}
      dotStyle={progressDots.circlePassiveOnboarding}
      activeDotStyle={progressDots.circleActiveOnboarding}
      onFinish={onFinish}
    />
  )
}

OnboardingEducationScreen.navigationOptions = {
  ...nuxNavigationOptions,
  headerLeft: () => {
    return <Logo type={LogoTypes.DARK} />
  },
  headerLeftContainerStyle: { paddingLeft: Spacing.Thick24 },
  headerRight: () => <LanguageButton />,
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.onboardingBackground,
  },
})
