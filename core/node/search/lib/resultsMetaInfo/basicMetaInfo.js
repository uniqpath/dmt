function basicMetaInfo(provider) {
  return {
    providerHost: provider.providerHost,
    providerAddress: provider.providerAddress,
    providerPort: provider.providerPort,
    providerKey: provider.providerKey,
    contentId: provider.contentId
  };
}

export { basicMetaInfo };
