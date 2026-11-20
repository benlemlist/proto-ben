import { useMemo } from "react";
import { useInbox } from "./store";
import { canSee, matchFilters, matchScope, matchSearch, sortTime } from "./logic";

/** Conversations of the current view, filters and search, newest first. */
export function useListedConversations() {
  const { convs, ctx, scope, filters, search, has } = useInbox();
  const useFilters = has("filters");
  return useMemo(
    () => convs
      .filter((c) => canSee(c, ctx) && matchScope(c, scope, ctx) && (!useFilters || matchFilters(c, filters, ctx)) && matchSearch(c, search, ctx))
      .sort((a, b) => sortTime(b, ctx).localeCompare(sortTime(a, ctx))),
    [convs, ctx, scope, filters, search, useFilters],
  );
}
