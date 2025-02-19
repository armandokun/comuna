import { useEvent } from 'expo'
import { useVideoPlayer, VideoView } from 'expo-video'
import { useEffect } from 'react'
import { Pressable, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { Ionicons } from '@expo/vector-icons'

type Props = {
  videoUrl: string
  videoThumbnailUrl: string
  videoThumbnailBlurhash: string
  isVisible: boolean
}

const VideoPost = ({ videoUrl, videoThumbnailUrl, videoThumbnailBlurhash, isVisible }: Props) => {
  const player = useVideoPlayer(videoUrl, (setup) => {
    setup.loop = true
    setup.muted = true
    setup.play()
  })

  const { status: videoStatus } = useEvent(player, 'statusChange', {
    status: player.status,
  })

  useEffect(() => {
    if (!isVisible) return player.pause()

    player.play()
  }, [isVisible, player])

  return (
    <>
      {videoStatus === 'loading' && player.duration === 0 && (
        <Image
          source={videoThumbnailUrl}
          placeholder={{ blurhash: videoThumbnailBlurhash }}
          contentFit="cover"
          style={{ width: '100%', height: '100%' }}
        />
      )}
      <Pressable
        onPressIn={() => player.pause()}
        onPressOut={() => player.play()}
        onPress={() => {
          player.muted = false
        }}
        className="flex-1">
        <VideoView
          style={{
            flex: 1,
          }}
          contentFit="cover"
          nativeControls={false}
          player={player}
        />
      </Pressable>

      <TouchableOpacity
        className="absolute bottom-4 right-4"
        onPress={() => {
          player.muted = !player.muted
        }}>
        <Ionicons name={player.muted ? 'volume-mute' : 'volume-high'} size={24} color="white" />
      </TouchableOpacity>
    </>
  )
}

export default VideoPost
