/* eslint-disable react/no-unstable-nested-components */
import { Tabs } from 'expo-router'

import CustomTabBar from '@/components/CustomTabBar'

const TabsLayout = () => (
  <Tabs
    screenOptions={{
      headerShown: false,
      tabBarStyle: { display: 'none' }, // Hide default tab bar
    }}
    tabBar={(props) => <CustomTabBar {...props} />}>
    <Tabs.Screen
      name="home"
      options={{
        title: 'Home',
      }}
    />
    <Tabs.Screen
      name="profile/index"
      options={{
        title: 'Profile',
      }}
    />
  </Tabs>
)

export default TabsLayout
