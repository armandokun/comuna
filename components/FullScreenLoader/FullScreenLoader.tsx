import { Modal, View, ActivityIndicator } from 'react-native'
import { BlurView } from 'expo-blur'

import Text from '@/components/ui/Text'

type Props = {
  show: boolean
  title: string
}

const FullScreenLoader = ({ show, title }: Props) => (
  <Modal transparent animationType="fade" visible={show}>
    <BlurView
      className="absolute top-0 left-0 right-0 bottom-0"
      intensity={50}
      tint="systemChromeMaterialDark">
      <View className="justify-center items-center flex-1">
        <ActivityIndicator size="large" />
        <Text>{title}</Text>
      </View>
    </BlurView>
  </Modal>
)

export default FullScreenLoader
