import { Loader2 } from 'lucide-react'
import './LoadingSpinner.css'

interface LoadingSpinnerProps {
  size?: number
  text?: string
}

export default function LoadingSpinner({ size = 24, text }: LoadingSpinnerProps) {
  return (
    <div className="loading-spinner">
      <Loader2 size={size} className="spinner-icon" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  )
}

