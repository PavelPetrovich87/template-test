import type { NavigatorScreenParams } from '@react-navigation/native'

export type AuthStackParamList = {
  login: undefined
  register: undefined
}

export type MainTabParamList = {
  index: undefined
  game: undefined
  store: undefined
  stats: undefined
  settings: undefined
}

export type RootStackParamList = {
  '(auth)': NavigatorScreenParams<AuthStackParamList>
  '(main)': NavigatorScreenParams<MainTabParamList>
  leaderboard: undefined
  '+not-found': undefined
}

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
