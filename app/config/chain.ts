const PACKAGE =
  "0x28d91e48b77943014a5ec4c4f29c9a7945548b996549052c59d0bbbf3bbac737";

export const chainConfig = {
  package: PACKAGE,
  // UNI
  uniCoinType: `${PACKAGE}::uni::UNI`,
  uniCoinObjectType: `0x2::coin::Coin<${PACKAGE}::uni::UNI>`,
  uniCoinMintFunctionTarget: `${PACKAGE}::uni::mint`,
  // NAVX
  navxCoinType: `${PACKAGE}::navx::NAVX`,
  // Quiz
  quizObjectType: `${PACKAGE}::quiz::Quiz<${PACKAGE}::uni::UNI>`,
  quizMintFunctionTarget: `${PACKAGE}::quiz::mint_to_sender`,
  quizPassFunctionTarget: `${PACKAGE}::quiz::pass`,
};
