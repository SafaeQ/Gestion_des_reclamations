import { LeftOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Card, Input, message, Select, Switch, Form } from 'antd'
import { useMutation, useQuery } from 'react-query'
import { useHistory } from 'react-router-dom'
import { transport } from '../../../util/Api'

const formItemLayout = {
  labelCol: {
    span: 6
  },
  wrapperCol: {
    span: 10
  }
}

interface User {
  id: number
  username: string
}

export default function Create () {
  const {
    data: users,
    isLoading,
    isFetched
  } = useQuery<User[]>(
    'users',
    async () => await transport.get('/users/chef').then((res) => res.data)
  )

  const createMutation = useMutation(
    async (data) =>
      await transport
        .post('/entities/create', { entity: data })
        .then((res) => res.data),
    {
      onSuccess: async () => {
        form.resetFields()
        history.goBack()
        void message.success('Entity created')
      },
      onError: async (_err) => {
        void message.error('Error Creating')
      }
    }
  )

  const [form] = Form.useForm()
  const history = useHistory()

  const handleSave = () => {
    form
      .validateFields()
      .then((values) => {
        createMutation.mutate(values)
      })
      .catch(async () => await message.error('Error'))
  }
  return (
    <Card
      extra={[
        <Button
          key={1}
          loading={createMutation.isLoading}
          onClick={() => handleSave()}
          icon={<SaveOutlined />}
          type='primary'
        >
          Save
        </Button>,
        <Button
          key={2}
          onClick={() => history.goBack()}
          icon={<LeftOutlined />}
          type='link'
        >
          goBack
        </Button>
      ]}
      title='Create Entity'
    >
      <Form {...formItemLayout} labelAlign='left' form={form}>
        <Form.Item
          rules={[{ required: true, message: 'Please input the name!' }]}
          name='name'
          label='Name'
        >
          <Input placeholder='Name' />
        </Form.Item>
        <Form.Item
          rules={[{ required: true, message: 'Please input the api_link!' }]}
          name='api_link'
          label='Api'
        >
          <Input placeholder='Link' />
        </Form.Item>
        <Form.Item rules={[{ type: 'number' }]} name='chef' label='Select Chef'>
          <Select<number, { value: string, children: string }>
            showSearch
            optionFilterProp='children'
            filterOption={(input, option) =>
              (option != null) ? option.children.includes(input) : false
            }
            allowClear
            loading={isLoading}
          >
            {isFetched && (users != null)
              ? users.map((user) => (
                  <Select.Option value={user.id} key={user.id}>
                    {user.username}
                  </Select.Option>
                ))
              : []}
          </Select>
        </Form.Item>
        <Form.Item name='status' label='status' valuePropName='checked'>
          <Switch defaultChecked={true} />
        </Form.Item>
      </Form>
    </Card>
  )
}
