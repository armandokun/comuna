import { Text as NativeText, type TextProps as NativeTextProps } from 'react-native'

type TextType =
  | 'heading'
  | 'title1'
  | 'title2'
  | 'title3'
  | 'body'
  | 'callout'
  | 'subhead'
  | 'footnote'
  | 'caption'
  | 'button'
  | 'link'

type Props = NativeTextProps & {
  type?: TextType
  truncate?: boolean
}

const Text = ({ type = 'body', truncate, className, ...rest }: Props) => {
  const typeClasses = {
    heading: 'text-heading leading-heading font-semibold',
    title1: 'text-title1 leading-title1 font-semibold',
    title2: 'text-title2 leading-title2 font-medium',
    title3: 'text-title3 leading-title3 font-medium',
    body: 'text-body leading-body font-normal',
    callout: 'text-callout leading-callout font-normal',
    subhead: 'text-subhead leading-subhead font-medium',
    footnote: 'text-footnote leading-footnote font-normal',
    caption: 'text-caption leading-caption font-normal text-muted',
    button: 'text-button leading-button font-semibold',
    link: 'text-link leading-link font-normal text-primary',
  }

  const classNames = typeClasses[type] + (className ? ` ${className}` : '')

  return (
    <NativeText
      numberOfLines={truncate ? 1 : undefined}
      ellipsizeMode={truncate ? 'tail' : undefined}
      className={classNames}
      {...rest}
    />
  )
}

export default Text
