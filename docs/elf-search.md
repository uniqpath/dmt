<img src="http://subcults.com/img/elfsearch.png?v=6" width="400px">

# Ask them and they will find

```
SearchElf
  searchProvider: SearchProvider
  records: dirPath<String> | catalog<String>
  mediaType: Enum(photo | music | books | video)
methods:
  search(terms: String) -> results<String[]>

SearchProvider
  protocol: jsonRpc | ...
  host: String
  port: Int
```

## API example

```javascript
const client = new SearchClient(providers);
aggregateSearchResultsFormatter(await client.search({ terms, maxResults: 10 }));
```

This is an example of API usage from `node.js`, search itself is implemented in **Rust**. Rust search backend can either search through premade  catalogs (= fastest search in the world) or directly on the file system with native OS speed (fastest real-time search possible on a given machine). Search Elves themselves are living on the server side, client is not aware of them.
Also notice the infinite chainability of search providers, in every day terms this means that Elves can go ask other Elves and then deliver the results to you in the sum of all needed times and nothing more. If each of the subsearches is the fastest possible, then the chained search will also be fastest possible given the requested design of the *elfchain*.

Catalog creation is also fast and is achieved by running Elf Search itself at a given time (eg. cron) and caching the list of all results with blank search terms.
