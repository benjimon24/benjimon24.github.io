import { useState, useCallback } from 'react'

export interface BallData {
  id: string
  position: { x: number; y: number }
  velocity: { x: number; y: number }
  isAnimating: boolean
  isDragging: boolean
  size: number
  lastCollisionTime?: number
}

export interface CollisionUpdate {
  id: string
  velocity: { x: number; y: number }
  position: { x: number; y: number }
  isAnimating: boolean
  lastCollisionTime?: number
}

export interface CollisionResult {
  velocity: { x: number; y: number }
  position: { x: number; y: number }
  collided: boolean
  otherBallUpdates: CollisionUpdate[]
}

export interface UseBallsReturn {
  balls: BallData[]
  addBall: (initialX?: number, initialY?: number, size?: number) => string
  removeBall: (id: string) => void
  updateBall: (id: string, updates: Partial<BallData>) => void
  getBall: (id: string) => BallData | undefined
  clearAllBalls: () => void
  checkCollisions: (currentBallId: string, position: { x: number; y: number }, velocity: { x: number; y: number }, currentBalls: BallData[]) => CollisionResult
  applyCollisionUpdates: (updates: CollisionUpdate[]) => void
}

export const useBalls = (): UseBallsReturn => {
  const [balls, setBalls] = useState<BallData[]>([])

  const addBall = useCallback((initialX = 100, initialY = 0, size = 80): string => {
    const id = `ball-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newBall: BallData = {
      id,
      position: { x: initialX, y: initialY },
      velocity: { x: 0, y: 0 },
      isAnimating: true,
      isDragging: false,
      size
    }
    
    setBalls(prev => [...prev, newBall])
    return id
  }, [])

  const removeBall = useCallback((id: string) => {
    setBalls(prev => prev.filter(ball => ball.id !== id))
  }, [])

  const updateBall = useCallback((id: string, updates: Partial<BallData>) => {
    setBalls(prev => {
      // Check if the updates actually change anything to avoid unnecessary re-renders
      const existingBall = prev.find(ball => ball.id === id)
      if (!existingBall) return prev
      
      // Only update if something actually changed
      const hasChanges = Object.keys(updates).some(key => {
        const updateKey = key as keyof BallData
        return existingBall[updateKey] !== updates[updateKey]
      })
      
      if (!hasChanges) return prev
      
      return prev.map(ball => 
        ball.id === id ? { ...ball, ...updates } : ball
      )
    })
  }, [])

  const getBall = useCallback((id: string): BallData | undefined => {
    return balls.find(ball => ball.id === id)
  }, [balls])

  const clearAllBalls = useCallback(() => {
    setBalls([])
  }, [])

  const checkCollisions = useCallback((currentBallId: string, position: { x: number; y: number }, velocity: { x: number; y: number }, currentBalls: BallData[]): CollisionResult => {
    // Use the passed currentBalls instead of the closure balls
    const currentBall = currentBalls.find(ball => ball.id === currentBallId)
    if (!currentBall) {
      return {
        velocity,
        position,
        collided: false,
        otherBallUpdates: []
      }
    }

    let newVelocity = { ...velocity }
    let newPosition = { ...position }
    let hasCollided = false
    const otherBallUpdates: CollisionUpdate[] = []
    const currentTime = Date.now()

    // Get current ball state for collision detection
    const currentBallsState = currentBalls.filter(ball => {
      // Skip self, dragging balls, and balls that collided recently (cooldown)
      return ball.id !== currentBallId && 
             !ball.isDragging && 
             (!ball.lastCollisionTime || currentTime - ball.lastCollisionTime > 50) // 50ms cooldown
    })

    // Check collision with all other balls
    for (const otherBall of currentBallsState) {
      // Calculate distance between ball centers
      const dx = newPosition.x + currentBall.size / 2 - (otherBall.position.x + otherBall.size / 2)
      const dy = newPosition.y + currentBall.size / 2 - (otherBall.position.y + otherBall.size / 2)
      const distance = Math.sqrt(dx * dx + dy * dy)
      const minDistance = (currentBall.size + otherBall.size) / 2

      // Check if balls are colliding
      if (distance < minDistance && distance > 0) {
        hasCollided = true

        // Normalize collision vector
        const nx = dx / distance
        const ny = dy / distance

        // Relative velocity
        const rvx = newVelocity.x - otherBall.velocity.x
        const rvy = newVelocity.y - otherBall.velocity.y

        // Relative velocity along collision normal
        const speed = rvx * nx + rvy * ny

        // Don't resolve if velocities are separating
        if (speed > 0) continue

        // Calculate masses based on ball size (mass proportional to volume/area)
        const mass1 = Math.pow(currentBall.size / 80, 2) // Normalize to size 80 = mass 1
        const mass2 = Math.pow(otherBall.size / 80, 2)
        const totalMass = mass1 + mass2
        
        // Collision impulse using proper mass-based physics
        const restitution = 0.7 // Slightly less bouncy for stability
        const impulse = (2 * speed * restitution) / totalMass
        
        // Update current ball's velocity (elastic collision with mass consideration)
        newVelocity.x -= impulse * mass2 * nx
        newVelocity.y -= impulse * mass2 * ny

        // Separate balls to prevent overlap (heavier balls move less)
        const overlap = minDistance - distance + 2 // Small buffer for stability
        const mass1Factor = mass2 / totalMass // Heavier ball (mass2) pushes lighter ball (mass1) more
        const mass2Factor = mass1 / totalMass // Lighter ball (mass1) gets pushed more by heavier ball
        const separationX = nx * overlap * mass1Factor
        const separationY = ny * overlap * mass1Factor

        // Move current ball away from collision
        newPosition.x += separationX
        newPosition.y += separationY

        // Queue update for the other ball
        otherBallUpdates.push({
          id: otherBall.id,
          velocity: { 
            x: otherBall.velocity.x + impulse * mass1 * nx, 
            y: otherBall.velocity.y + impulse * mass1 * ny 
          },
          position: {
            x: otherBall.position.x - nx * overlap * mass2Factor,
            y: otherBall.position.y - ny * overlap * mass2Factor
          },
          isAnimating: true,
          lastCollisionTime: currentTime
        })
      }
    }

    return {
      velocity: newVelocity,
      position: newPosition,
      collided: hasCollided,
      otherBallUpdates
    }
  }, [])  // Remove the balls dependency to prevent frequent callback changes

  const applyCollisionUpdates = useCallback((updates: CollisionUpdate[]) => {
    if (updates.length === 0) return
    
    setBalls(prev => prev.map(ball => {
      const update = updates.find(u => u.id === ball.id)
      return update ? { ...ball, ...update } : ball
    }))
  }, [])

  return {
    balls,
    addBall,
    removeBall,
    updateBall,
    getBall,
    clearAllBalls,
    checkCollisions,
    applyCollisionUpdates
  }
}
