import variables from '@celo/react-components/styles/variables'
import React from 'react'
import { Platform, StyleSheet, Text, View } from 'react-native'
import { styles as headerStyles } from 'src/navigator/Headers'

interface Props {
  left?: React.ReactNode
  right?: React.ReactNode
  title?: React.ReactNode | string
}

function CustomHeader({ left, right, title }: Props) {
  const titleComponent =
    typeof title === 'string' ? <Text style={headerStyles.headerTitle}>{title}</Text> : title
  return (
    <View style={styles.container}>
      {left && <View style={styles.buttonContainer}>{left}</View>}
      {right && <View style={styles.buttonContainer}>{right}</View>}
      {title && <View style={styles.titleContainer}>{titleComponent}</View>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 44 : 56,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buttonContainer: {
    height: '100%',
    padding: variables.contentPadding,
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    left: 60,
    right: 60,
  },
})

export default CustomHeader
