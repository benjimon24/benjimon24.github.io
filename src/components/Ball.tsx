import React, { useState, useEffect, useCallback, useRef } from 'react'
import { BallData, CollisionResult, CollisionUpdate } from '../hooks/useBalls'

interface BallProps {
  id?: string
  initialX?: number
  initialY?: number
  size?: number
  allBalls?: BallData[]
  onUpdate?: (id: string, data: Partial<BallData>) => void
  onCheckCollisions?: (currentBallId: string, position: { x: number; y: number }, velocity: { x: number; y: number }, currentBalls: BallData[]) => CollisionResult
  onApplyCollisionUpdates?: (updates: CollisionUpdate[]) => void
}

const Ball: React.FC<BallProps> = ({ 
  id, 
  initialX = 100, 
  initialY = 0, 
  size = 80,
  allBalls = [],
  onUpdate, 
  onCheckCollisions,
  onApplyCollisionUpdates
}) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY })
  const [velocity, setVelocity] = useState({ x: 0, y: 0 })
  const [isAnimating, setIsAnimating] = useState(true) // Start animating immediately
  const [isDragging, setIsDragging] = useState(false)
  const [containerBounds, setContainerBounds] = useState({ width: 0, height: 0 })
  
  // Use refs to avoid stale closures in event handlers and animation
  const isDraggingRef = useRef(false)
  const isAnimatingRef = useRef(true)
  const dragOffsetRef = useRef({ x: 0, y: 0 })
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  const dragVelocityRef = useRef({ x: 0, y: 0 })
  const allBallsRef = useRef<BallData[]>([])
  const ballRef = useRef<HTMLDivElement>(null)

  // Update refs when state changes
  useEffect(() => {
    isDraggingRef.current = isDragging
  }, [isDragging])

  useEffect(() => {
    isAnimatingRef.current = isAnimating
  }, [isAnimating])

  // Update allBalls ref when it changes
  useEffect(() => {
    allBallsRef.current = allBalls || []
  }, [allBalls])

  // Physics constants - now mass-dependent
  const mass = Math.pow(size / 80, 2) // Normalize to size 80 = mass 1
  const gravity = 0.6 * Math.min(mass, 2) // Heavier balls fall faster but cap the effect
  const bounce = 0.85 * (1 - mass * 0.1) // Heavier balls lose more energy on bounce
  const friction = 0.997 + (mass * 0.001) // Heavier balls have slightly less air resistance
  const momentumScale = 0.75 * (1 + mass * 0.2) // Heavier balls retain more momentum when dragged
  const ballSize = size

  // Different colors based on mass
  const getBackgroundColor = (mass: number) => {
    if (mass < 0.5) {
      // Light balls - blue tones
      return 'radial-gradient(circle at center, #64B5F6, #42A5F5, #2196F3, #1976D2)'
    } else if (mass < 1.5) {
      // Medium balls - original red/orange tones
      return 'radial-gradient(circle at center, #ff6b6b, #ff4757, #e74c3c, #c0392b)'
    } else {
      // Heavy balls - purple/dark tones
      return 'radial-gradient(circle at center, #AB47BC, #9C27B0, #8E24AA, #7B1FA2)'
    }
  }

  // Calculate container bounds
  useEffect(() => {
    const updateBounds = () => {
      if (ballRef.current && ballRef.current.parentElement) {
        const parent = ballRef.current.parentElement
        const rect = parent.getBoundingClientRect()
        setContainerBounds({ width: rect.width, height: rect.height })
      }
    }

    updateBounds()
    window.addEventListener('resize', updateBounds)
    return () => window.removeEventListener('resize', updateBounds)
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event bubbling
    
    setIsDragging(true)
    setIsAnimating(false) // Stop physics while dragging
    
    // Initialize mouse position tracking
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
    dragVelocityRef.current = { x: 0, y: 0 }
    
    // Simple offset calculation: where in the ball did we click?
    const rect = e.currentTarget.getBoundingClientRect()
    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }, [])

  // Mouse event listeners - simplified approach
  useEffect(() => {
    const ball = ballRef.current
    if (!ball) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return
      
      // Calculate velocity
      const deltaX = e.clientX - lastMousePosRef.current.x
      const deltaY = e.clientY - lastMousePosRef.current.y
      
      dragVelocityRef.current = {
        x: dragVelocityRef.current.x * 0.5 + deltaX * 0.5,
        y: dragVelocityRef.current.y * 0.5 + deltaY * 0.5
      }
      
      lastMousePosRef.current = { x: e.clientX, y: e.clientY }
      
      // Update position
      const container = ball.parentElement
      if (!container) return
      
      const containerRect = container.getBoundingClientRect()
      const newX = e.clientX - containerRect.left - dragOffsetRef.current.x
      const newY = e.clientY - containerRect.top - dragOffsetRef.current.y
      
      setPosition({
        x: Math.max(0, Math.min(containerBounds.width - ballSize, newX)),
        y: Math.max(0, Math.min(containerBounds.height - ballSize, newY))
      })
    }

    const handleMouseUp = () => {
      if (!isDraggingRef.current) return
      
      setIsDragging(false)
      setVelocity({ 
        x: dragVelocityRef.current.x * momentumScale, 
        y: dragVelocityRef.current.y * momentumScale 
      })
      setIsAnimating(true)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging]) // Only depend on isDragging state

  // Ensure animation starts on mount and after drag ends
  useEffect(() => {
    if (!isDragging && !isAnimating) {
      // Force animation to start if ball is not being dragged
      setIsAnimating(true)
    }
  }, [isDragging, isAnimating])

  // Physics animation loop - using refs to avoid state dependency issues
  useEffect(() => {
    if (!ballRef.current) return
    
    const containerBoundsRef = { current: containerBounds }
    
    const animate = () => {
      if (!isAnimatingRef.current || isDraggingRef.current) return
      
      setPosition(prevPos => {
        let newX = prevPos.x
        let newY = prevPos.y
        
        setVelocity(prevVel => {
          let newVelX = prevVel.x * friction
          let newVelY = prevVel.y + gravity

          newX = prevPos.x + newVelX
          newY = prevPos.y + newVelY

          // Check collisions with other balls if we have collision functions and multiple balls
          if (id && onCheckCollisions && onApplyCollisionUpdates && allBallsRef.current.length > 1) {
            const collisionResult = onCheckCollisions(id, { x: newX, y: newY }, { x: newVelX, y: newVelY }, allBallsRef.current)
            
            if (collisionResult.collided) {
              newVelX = collisionResult.velocity.x
              newVelY = collisionResult.velocity.y
              newX = collisionResult.position.x
              newY = collisionResult.position.y
              
              // Apply updates to other balls
              if (collisionResult.otherBallUpdates.length > 0) {
                onApplyCollisionUpdates(collisionResult.otherBallUpdates)
              }
            }
          }

          // Wall collisions (left and right) - use current container bounds
          const currentContainerBounds = containerBoundsRef.current
          if (newX <= 0 || newX >= currentContainerBounds.width - ballSize) {
            newVelX = -newVelX * bounce
            newX = newX <= 0 ? 0 : currentContainerBounds.width - ballSize
          }

          // Floor collision
          const currentFloorY = currentContainerBounds.height - ballSize
          if (newY >= currentFloorY) {
            newY = currentFloorY
            newVelY = -newVelY * bounce
            
            // Stop vertical bounces much earlier to prevent jitter, but allow horizontal rolling
            if (Math.abs(newVelY) < 3.0) {
              newVelY = 0 // Stop vertical bouncing early but keep horizontal movement
            }
            
            // Stop animation completely only when horizontal is very slow (vertical already stopped)
            if (Math.abs(newVelY) < 0.1 && Math.abs(newVelX) < 1) {
              setIsAnimating(false)
              return { x: 0, y: 0 }
            }
          }

          // Ceiling collision
          if (newY <= 0) {
            newY = 0
            newVelY = -newVelY * bounce
          }

          return { x: newVelX, y: newVelY }
        })

        // Return the new position (including any collision adjustments)
        return {
          x: Math.max(0, Math.min(containerBoundsRef.current.width - ballSize, newX)),
          y: Math.max(0, Math.min(containerBoundsRef.current.height - ballSize, newY))
        }
      })
    }

    const intervalId = setInterval(animate, 16) // ~60fps
    return () => clearInterval(intervalId)
  }, [containerBounds, ballSize, friction, gravity, bounce]) // Include essential dependencies

  // Safety mechanism: automatically exit drag state if stuck
  useEffect(() => {
    if (isDragging) {
      // Set a timeout to automatically exit drag state after 10 seconds
      const safetyTimeout = setTimeout(() => {
        console.warn('Ball drag state timeout - forcing exit')
        setIsDragging(false)
        setIsAnimating(true)
      }, 10000)
      
      return () => clearTimeout(safetyTimeout)
    }
  }, [isDragging])

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    // Double-click to force exit drag state if stuck
    if (isDragging) {
      setIsDragging(false)
      setIsAnimating(true)
    }
  }, [isDragging])

  // Notify parent hook when ball state changes - simplified to reduce interference
  useEffect(() => {
    if (id && onUpdate && allBalls && allBalls.length > 1) {
      // Only report state for multiple balls, and only when dragging ends to avoid animation interference
      if (!isDragging) {
        onUpdate(id, {
          position,
          velocity,
          isAnimating,
          isDragging,
          size: ballSize
        })
      }
    }
  }, [isDragging, position.x, position.y]) // Only trigger when drag ends or position significantly changes

  return (
    <div
      ref={ballRef}
      className={`ball ${isDragging ? 'dragging' : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${ballSize}px`,
        height: `${ballSize}px`,
        // Mass-based visual properties
        background: `
          radial-gradient(ellipse 60% 50% at 30% 30%, rgba(255, 255, 255, 0.3), transparent 50%),
          ${getBackgroundColor(mass)}
        `,
        boxShadow: `
          0 ${4 + mass * 2}px ${12 + mass * 4}px rgba(0, 0, 0, ${0.3 + mass * 0.1}),
          inset 0 0 0 1px rgba(255, 255, 255, 0.1),
          inset 0 0 20px rgba(0, 0, 0, ${0.2 + mass * 0.1})
        `,
        // Slightly darker appearance for heavier balls
        filter: `brightness(${1 - mass * 0.05}) saturate(${1 + mass * 0.1})`,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    />
  )
}

export default Ball
