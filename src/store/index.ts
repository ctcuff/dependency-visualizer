import { createStore, combineReducers, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import searchReducer from './reducers/search'
import graphReducer from './reducers/graph'
import packageReducer from './reducers/package'

// @ts-ignore
const storeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const reducer = combineReducers({
    search: searchReducer,
    graph: graphReducer,
    package: packageReducer
})

const store = createStore(reducer, storeEnhancers(applyMiddleware(thunk)))

export type RootState = ReturnType<typeof reducer>
export default store
