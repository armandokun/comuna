import { Alert } from 'react-native'

import { supabase } from './supabase'

export const signOut = async (onSignOut: () => void) => {
  const { error } = await supabase.auth.signOut()

  if (error) {
    Alert.alert(error.message)

    return
  }

  onSignOut()
}

export const mockSignIn = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'password123',
  })

  if (error) {
    Alert.alert('Error signing in:', error.message)

    return
  }

  return data
}
