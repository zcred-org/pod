import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/prove/mismatch')({
  component: () => <div>Hello /prove/mismatch!</div>
})
