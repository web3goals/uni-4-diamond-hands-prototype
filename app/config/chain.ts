const PACKAGE =
  "0x3b1b22dc5f3978a08673a5665199e86706d24ffbe428801ecc0c3c9d1cf41c54";

export const chainConfig = {
  uniCoinType: `${PACKAGE}::uni::UNI`,
  uniCoinObjectType: `0x2::coin::Coin<${PACKAGE}::uni::UNI>`,
  quizObjectType: `${PACKAGE}::quiz::Quiz<${PACKAGE}::uni::UNI>`,
  quizMintFunctionTarget: `${PACKAGE}::quiz::mint_to_sender`,
  quizPassFunctionTarget: `${PACKAGE}::quiz::pass`,
};
