const PACKAGE =
  "0x28d91e48b77943014a5ec4c4f29c9a7945548b996549052c59d0bbbf3bbac737";

export const chainConfig = {
  package: PACKAGE,
  // UNI
  uniCoinType: `${PACKAGE}::uni::UNI`,
  uniCoinTreasuryObject:
    "0x7edc3ccd78c6c45e18d276cb933339c9a3b2e1a55a8af03c96c3aac8df92948c",
  uniCoinObjectType: `0x2::coin::Coin<${PACKAGE}::uni::UNI>`,
  uniCoinMintFunctionTarget: `${PACKAGE}::uni::mint`,
  // NAVX
  navxCoinType: `${PACKAGE}::navx::NAVX`,
  navxCoinTreasuryObject:
    "0x172f0923181cd4360e07d895449c4e810496424fe95de0d342b5609139a921b5",
  navxCoinMintFunctionTarget: `${PACKAGE}::navx::mint`,
  // Quiz
  quizObjectType: `${PACKAGE}::quiz::Quiz<${PACKAGE}::uni::UNI>`,
  quizMintFunctionTarget: `${PACKAGE}::quiz::mint_to_sender`,
  quizPassFunctionTarget: `${PACKAGE}::quiz::pass`,
};
