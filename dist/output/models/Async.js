// import queryString from 'query-string';

export default {
  namespace: 'async',
  state: {},
  reducers: {
    tests(state, { payload }) {
      return { ...state, ...payload }
    },
  },
  effects: {
    *reqTests({ payload }, { call, put }) {
      var res = yield Promise.resolve('world');
      yield put({ type: 'tests', payload: { hello:res } })
    },
  },
}
