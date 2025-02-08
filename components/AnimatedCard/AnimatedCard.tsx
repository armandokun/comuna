import { Animated, Dimensions, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef, useState } from 'react'
import { Image } from 'expo-image'

import Text from '@/components/ui/Text'
import { Post } from '@/constants/mockData'

import GradientBlur from '../GradientBlur'

type Props = {
  item: Post
}

const AnimatedCard = ({ item }: Props) => {
  const descriptionRef = useRef<View>(null)
  const [descriptionHeight, setDescriptionHeight] = useState(0)

  useEffect(() => {
    if (!descriptionRef.current) return

    descriptionRef.current.measure((x, y, width, height, pageX, pageY) => {
      setDescriptionHeight(height)
    })
  }, [])

  const { height } = Dimensions.get('screen')

  const ITEM_SIZE = height * 0.62
  const DEFAULT_HEIGHT = 50

  return (
    <Animated.View
      className="rounded-3xl overflow-hidden"
      style={[
        {
          height: ITEM_SIZE,
        },
      ]}>
      <View className="relative flex-1">
        <GradientBlur height={descriptionHeight + DEFAULT_HEIGHT}>
          <Image
            source={`${item.image_url}?quality=50`}
            contentFit="cover"
            style={{ width: '100%', height: '100%' }}
          />
        </GradientBlur>
        <View className="absolute w-full gap-4">
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} locations={[0, 1]}>
            <View className="flex-row items-center gap-2 p-4">
              <Image
                source={{ uri: `${item.author.avatar_url}?width=32&height=32` }}
                contentFit="cover"
                style={{ width: 32, height: 32, borderRadius: 32 }}
              />
              <Text type="subhead" className="text-white">
                {item.author.name}
              </Text>
            </View>
          </LinearGradient>
        </View>
        <View className="absolute bottom-4 w-full px-4" ref={descriptionRef}>
          <Text type="footnote" className="text-white">
            {item.description}
          </Text>
        </View>
      </View>
    </Animated.View>
  )
}

export default AnimatedCard
