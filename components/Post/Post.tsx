import { Animated, Dimensions, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useEffect, useRef, useState } from 'react'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

import Text from '@/components/ui/Text'
import PostType from '@/types/post'
import { Colors } from '@/constants/colors'

import GradientBlur from '../GradientBlur'

type Props = {
  item: PostType
  onPress: () => void
}

const Post = ({ item, onPress }: Props) => {
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
            placeholder={{ blurhash: item.image_blurhash }}
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
        <View
          className="absolute bottom-2 w-full px-4 flex-row items-center justify-between"
          ref={descriptionRef}>
          <View className="flex-1">
            <Text type="footnote" className="text-white">
              {item.description}
            </Text>
          </View>
          <TouchableOpacity className="flex-row items-center gap-2" onPress={onPress}>
            <Ionicons name="chatbox-ellipses-outline" size={24} color={Colors.text} />
            <Text type="button" className="text-white">
              {item.comments_count || 0}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  )
}

export default Post
