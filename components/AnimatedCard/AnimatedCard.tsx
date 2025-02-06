import { Animated, Dimensions, Image, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef, useState } from 'react'
import { faker } from '@faker-js/faker'

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
          <Image className="w-full h-full" source={{ uri: item.image_url }} resizeMode="cover" />
        </GradientBlur>
        <View className="absolute w-full gap-4">
          <LinearGradient colors={['rgba(0,0,0,0.6)', 'transparent']} locations={[0, 1]}>
            <View className="flex-row items-center gap-2 p-4">
              <Image className="size-8 rounded-full" source={{ uri: faker.image.avatarGitHub() }} />
              <Text type="subhead" className="text-white">
                {faker.person.fullName()}
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
