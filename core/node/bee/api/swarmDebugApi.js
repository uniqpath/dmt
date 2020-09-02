import { createRequester, simpleGetRequest } from './apiCommon';

class SwarmDebugApi {
  constructor(port = 6060) {
    this.requester = createRequester({ port });
  }

  get(endpoint) {
    return simpleGetRequest(endpoint, this.requester);
  }
}

export default SwarmDebugApi;
