import { createFileRoute } from '@tanstack/react-router'

type SearchParams = {
  id: string;
};

export const Route = createFileRoute('/_authed/_admin/events/detail')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    id: search.id as string,
  }),
})
