export default function identifyUser({ program, ethAddress }) {
  if (ethAddress) {
    const identity = program.metamask().getPersonIdentity(ethAddress);

    if (identity) {
      return { userIdentity: identity.id, isAdmin: identity.admin, teams: identity.teams };
    }

    return { unknownIdentity: true }; // just to be clear, not actually used
  }
}