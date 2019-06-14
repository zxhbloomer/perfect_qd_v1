import Mock from 'mockjs'

const List = []
const count = 200
for (let i = 0; i < count; i++) {
  List.push(Mock.mock({
    id: '@increment',
    create_dt: +Mock.Random.date('T'),
    role_name: '@first'
  }))
}

export default [
  {
    url: '/sys/org/list',
    type: 'post',
    response: config => {
      const { role_name, page = 1, limit = 20, sort } = config.query

      let mockList = List.filter(item => {
        if (role_name && item.role_name.indexOf(role_name) < 0) return false
        return true
      })

      if (sort === '-id') {
        mockList = mockList.reverse()
      }

      const pageList = mockList.filter((item, index) => index < limit * page && index >= limit * (page - 1))

      return {
        code: 20000,
        data: {
          total: mockList.length,
          datas: pageList
        }
      }
    }

  }
]
