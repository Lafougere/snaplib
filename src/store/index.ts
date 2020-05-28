import { createStore } from 'redux'
// import {  StateType } from 'typesafe-actions'
import { reducer } from './reducer'

export const store = createStore(reducer)