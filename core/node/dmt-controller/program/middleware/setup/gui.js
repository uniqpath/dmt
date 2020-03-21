export default (program, { expressAppSetup }) => {
  program.server.setupRoutes(expressAppSetup);
};
