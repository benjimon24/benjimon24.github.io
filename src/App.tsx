import './styles/main.scss'
import BallManager from './components/BallManager'

const App: React.FC = () => {
  return (
    <div className="app">
      {/* 3D Room wireframe */}
      <div className="room">        
        {/* <Door /> */}
        <BallManager />
      </div>
    </div>
  )
}

export default App
