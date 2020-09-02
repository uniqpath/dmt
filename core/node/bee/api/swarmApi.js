import { createRequester, simpleGetRequest } from './apiCommon';

class SwarmApi {
  constructor(port = 8080) {
    this.requester = createRequester({ port });
  }

  tagStatus(tagId) {
    return simpleGetRequest(`tags/${tagId}`, this.requester);
  }
}

export default SwarmApi;
