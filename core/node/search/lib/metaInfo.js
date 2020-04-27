function basicMetaInfo(provider) {
  return { providerHost: provider.providerHost, providerAddress: provider.providerAddress, contentId: provider.localContentId };
}

export { basicMetaInfo };
