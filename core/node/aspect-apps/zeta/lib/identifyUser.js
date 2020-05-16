export default function identifyUser({ program, ethAddress }) {
  if (ethAddress) {
    const identity = program.metamask().getPersonIdentity(ethAddress);

    if (identity) {
      return { userIdentity: identity.id, isAdmin: identity.admin };
    }

    return { unknownIdentity: true };
  }
}
