import React from 'react'
import { useBalls } from '../hooks/useBalls'
import Ball from './Ball'

interface BallManagerProps {
  containerStyle?: React.CSSProperties
}

const BallManager: React.FC<BallManagerProps> = ({ 
  containerStyle = { width: '100vw', height: '100vh', position: 'relative' }
}) => {
  const { balls, addBall, removeBall, updateBall, checkCollisions, applyCollisionUpdates } = useBalls()

  const handleAddBall = () => {
    // Add ball at random position in upper part of container
    const randomX = Math.random() * 400 + 100
    const randomY = Math.random() * 100
    const randomSize = 60 + Math.random() * 40 // Size between 60-100px
    addBall(randomX, randomY, randomSize)
  }

  const handleAddLightBall = () => {
    const randomX = Math.random() * 400 + 100
    const randomY = Math.random() * 100
    addBall(randomX, randomY, 50) // Light ball
  }
  
  const handleAddMediumBall = () => {
    const randomX = Math.random() * 400 + 100
    const randomY = Math.random() * 100
    addBall(randomX, randomY, 80) // Medium ball  
  }
  
  const handleAddHeavyBall = () => {
    const randomX = Math.random() * 400 + 100
    const randomY = Math.random() * 100
    addBall(randomX, randomY, 120) // Heavy ball
  }

  const handleClearBalls = () => {
    balls.forEach(ball => removeBall(ball.id))
  }

  return (
    <div style={containerStyle}>
      {/* Control buttons */}
      <div style={{ 
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={handleAddBall}
            style={{
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Random ({balls.length})
          </button>
          <button 
            onClick={handleClearBalls}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Clear All
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '5px' }}>
          <button 
            onClick={handleAddLightBall}
            style={{
              padding: '6px 12px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Light Ball
          </button>
          <button 
            onClick={handleAddMediumBall}
            style={{
              padding: '6px 12px',
              backgroundColor: '#FF9800',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Medium Ball
          </button>
          <button 
            onClick={handleAddHeavyBall}
            style={{
              padding: '6px 12px',
              backgroundColor: '#9C27B0',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Heavy Ball
          </button>
        </div>
      </div>

      {/* Debug info */}
      <div style={{
        position: 'absolute',
        top: '100px', // Moved down to accommodate extra buttons
        left: '10px',
        zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.7)',
        color: 'white',
        padding: '10px',
        borderRadius: '4px',
        fontSize: '12px',
        maxHeight: '200px',
        overflow: 'auto'
      }}>
        <strong>Ball Tracker ({balls.length} balls)</strong>
        {balls.map(ball => {
          const mass = Math.pow(ball.size / 80, 2)
          return (
            <div key={ball.id} style={{ marginTop: '5px' }}>
              <div>ID: {ball.id.slice(-8)}</div>
              <div>Size: {ball.size}px (Mass: {mass.toFixed(2)})</div>
              <div>Pos: ({Math.round(ball.position.x)}, {Math.round(ball.position.y)})</div>
              <div>Vel: ({Math.round(ball.velocity.x * 10)/10}, {Math.round(ball.velocity.y * 10)/10})</div>
              <div>State: {ball.isDragging ? '🎯 DRAGGING' : ball.isAnimating ? '⚡ Animating' : '⏸️ Stopped'}</div>
              <button 
                onClick={() => removeBall(ball.id)}
                style={{
                  marginTop: '2px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  backgroundColor: '#ff6b6b',
                  color: 'white',
                  border: 'none',
                  borderRadius: '2px',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          )
        })}
      </div>

      {/* Render all balls */}
      {balls.map(ball => (
        <Ball
          key={ball.id}
          id={ball.id}
          initialX={ball.position.x}
          initialY={ball.position.y}
          size={ball.size}
          allBalls={balls}
          onUpdate={updateBall}
          onCheckCollisions={checkCollisions}
          onApplyCollisionUpdates={applyCollisionUpdates}
        />
      ))}
    </div>
  )
}

export default BallManager
