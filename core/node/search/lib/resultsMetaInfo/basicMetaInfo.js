function basicMetaInfo(provider) {
  return {
    providerHost: provider.providerHost,
    providerAddress: provider.providerAddress,
    providerPort: provider.providerPort,
    contentId: provider.contentId
  };
}

export { basicMetaInfo };
