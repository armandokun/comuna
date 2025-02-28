import { ReactNode } from 'react'
import { Pressable, View } from 'react-native'
import { BlurView } from 'expo-blur'

import Text from '@/components/ui/Text'
import { Colors } from '@/constants/colors'

type TabViewProps = {
  activeIndex: number
  tabs: Array<{
    title: string
    content: ReactNode
  }>
  onTabChange: (index: number) => void
}

const TabView = ({ tabs, activeIndex, onTabChange }: TabViewProps) => (
  <View>
    <BlurView
      tint="dark"
      intensity={70}
      className="flex-row rounded-full p-1 mb-4 relative overflow-hidden">
      {tabs.map((tab, index) => (
        <Pressable
          key={tab.title}
          className={`flex-1 p-2 rounded-full ${
            activeIndex === index ? 'bg-text' : 'bg-transparent'
          }`}
          onPress={() => onTabChange(index)}>
          <Text
            type="subhead"
            style={{ color: activeIndex === index ? Colors.background : Colors.muted }}
            className="text-center">
            {tab.title}
          </Text>
        </Pressable>
      ))}
    </BlurView>
    <View>{tabs[activeIndex].content}</View>
  </View>
)

export default TabView
