import Text from '@/components/ui/Text'

type Props = {
  title: string
}

const Label = ({ title }: Props) => (
  <Text
    type="footnote"
    className="uppercase ml-4 flex-1 mb-2"
    style={{
      color: 'rgba(255, 255, 255, 0.7)',
      fontWeight: 400,
    }}>
    {title}
  </Text>
)

export default Label
