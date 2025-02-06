import { Animated, Dimensions, Image, View } from 'react-native'

import { LinearGradient } from 'expo-linear-gradient'

import Text from '@/components/ui/Text'

import GradientBlur from '../GradientBlur'

type Item = {
  title: string
  description: string
  image: string
  author: {
    name: string
    avatar: string
  }
}

type Props = {
  item: Item
}

const AnimatedCard = ({ item }: Props) => {
  const { height } = Dimensions.get('screen')

  const ITEM_SIZE = height * 0.62

  return (
    <Animated.View
      className="rounded-3xl overflow-hidden"
      style={[
        {
          height: ITEM_SIZE,
        },
      ]}>
      <View className="relative flex-1">
        <GradientBlur>
          <Image className="w-full h-full" source={{ uri: item.image }} resizeMode="cover" />
        </GradientBlur>
        <View className="absolute w-full gap-4">
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} locations={[0, 1]}>
            <View className="flex-row items-center gap-2 p-4">
              <Image className="size-8 rounded-full" source={{ uri: item.author.avatar }} />
              <Text type="subhead" className="text-white">
                {item.author.name}
              </Text>
            </View>
          </LinearGradient>
        </View>
        <View className="absolute bottom-4 left-4 right-4">
          <Text type="footnote" className="text-white">
            {item.description}
          </Text>
        </View>
      </View>
    </Animated.View>
  )
}

export default AnimatedCard
