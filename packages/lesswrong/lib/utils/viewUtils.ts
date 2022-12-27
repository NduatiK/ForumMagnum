import { getCollection } from '../vulcan-lib/getCollection';

// Given a view (which gets translated into a mongo query), provide a string
// which describes what's being queried (ie the view name, and a list of
// parameters that were attached, but not the values of those parameters). This
// is attached to the mongodb query by putting a $comment in the selector, so
// that when we see slow queries in the profiler, we can easily identify the
// source.
export function describeTerms(terms: ViewTermsBase) {
  const viewName = terms.view || "defaultView";
  const otherTerms = Object.keys(terms).filter(key => key!=='view').join(',');
  if (otherTerms.length>0)
    return `${viewName}(${otherTerms})`;
  else
    return viewName;
}

export function viewTermsToQuery<N extends CollectionNameString>(collectionName: N, terms: ViewTermsByCollectionName[N], apolloClient?: any, resolverContext?: ResolverContext) {
  const collection = getCollection(collectionName);
  return collection.getParameters(terms, apolloClient, resolverContext);
}

export function getDefaultViewSelector<N extends CollectionNameString>(collectionName: N) {
  const viewQuery = viewTermsToQuery(collectionName, {})
  // TODO: Postprocess out viewFieldNullOrMissing
  return viewQuery.selector;
}
