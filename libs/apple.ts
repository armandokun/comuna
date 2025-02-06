import { Alert } from 'react-native'
import * as AppleAuthentication from 'expo-apple-authentication'

import { supabase } from './supabase'

export const signInWithApple = async () => {
  try {
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    })

    if (credential.identityToken) {
      const response = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      })

      if (response.error) {
        Alert.alert('Error', response.error.message, [{ text: 'OK' }])
      }
    } else {
      throw new Error('no email present!')
    }
  } catch (error: any) {
    if (error.code === 'ERR_REQUEST_CANCELED') return

    Alert.alert('Error', error.message, [{ text: 'OK' }])
  }
}
