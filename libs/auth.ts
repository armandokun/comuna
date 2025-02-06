import { Alert } from 'react-native'

import { supabase } from './supabase'

export const signOut = async (onSignOut: () => void) => {
  const { error } = await supabase.auth.signOut()

  if (error) Alert.alert(error.message)

  onSignOut()
}
