import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/_admin/messages/detail')({
  validateSearch: (search: Record<string, unknown>): { id: string } => ({
    id: search.id as string,
  }),
})
