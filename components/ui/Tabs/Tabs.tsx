import { ReactNode } from 'react'
import { Pressable, View } from 'react-native'

import Text from '@/components/ui/Text'

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
    <View className="flex-row rounded-xl bg-disabled p-1 mb-4 relative">
      {tabs.map((tab, index) => (
        <Pressable
          key={tab.title}
          className={`flex-1 p-2 rounded-lg ${
            activeIndex === index ? 'bg-primary' : 'bg-transparent'
          }`}
          onPress={() => onTabChange(index)}>
          <Text
            type="subhead"
            color={activeIndex === index ? 'background' : 'muted'}
            className="text-center">
            {tab.title}
          </Text>
        </Pressable>
      ))}
    </View>
    <View>{tabs[activeIndex].content}</View>
  </View>
)

export default TabView
