import { ReactNode } from 'react'
import { MenuAction, MenuView, MenuComponentProps } from '@react-native-menu/menu'

type Props = {
  title?: string
  itemId: number
  children: ReactNode
  actions: Array<MenuAction>
  onPress: (id: string, itemId: number) => void
  shouldOpenOnLongPress?: boolean
} & MenuComponentProps

const ContextMenu = ({
  title,
  children,
  actions,
  onPress,
  itemId,
  shouldOpenOnLongPress = true,
  ...props
}: Props) => (
  <MenuView
    title={title}
    onPressAction={({ nativeEvent }) => onPress(nativeEvent.event, itemId)}
    actions={actions}
    shouldOpenOnLongPress={shouldOpenOnLongPress}
    themeVariant="dark"
    {...props}>
    {children}
  </MenuView>
)

export default ContextMenu
