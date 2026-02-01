import { AppRoot, View, Panel } from '@vkontakte/vkui'
import Home from './pages/Homee'

function App() {

  return (
    <AppRoot>
      <View activePanel='home'>
        <Panel id='home'>
          <Home />
        </Panel>
      </View>
    </AppRoot>
  )
}

export default App
