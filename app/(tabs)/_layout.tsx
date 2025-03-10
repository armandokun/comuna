/* eslint-disable react/no-unstable-nested-components */
import { Tabs } from 'expo-router'

import CustomTabBar from '@/components/CustomTabBar'

const TabsLayout = () => (
  <Tabs
    screenOptions={{
      headerShown: false,
    }}
    tabBar={(props) => <CustomTabBar {...props} />}>
    <Tabs.Screen
      name="home"
      options={{
        title: 'Home',
      }}
    />
    <Tabs.Screen
      name="profile"
      options={{
        title: 'Profile',
      }}
    />
  </Tabs>
)

export default TabsLayout
