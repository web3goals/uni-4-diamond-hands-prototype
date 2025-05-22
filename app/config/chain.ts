const PACKAGE =
  "0x6d4353597f2f266457bedd5fc4c67c6b65083e85794e323065806831164f9008";

export const chainConfig = {
  package: PACKAGE,
  // UNI
  uniCoinType: `${PACKAGE}::uni::UNI`,
  uniCoinTreasuryObject:
    "0xaa25526c098e4a3f3659d0c52802179790fb89d8bfa980a7cf9b39431987939a",
  uniCoinObjectType: `0x2::coin::Coin<${PACKAGE}::uni::UNI>`,
  uniCoinMintFunctionTarget: `${PACKAGE}::uni::mint`,
  // NAVX
  navxCoinType: `${PACKAGE}::navx::NAVX`,
  navxCoinTreasuryObject:
    "0xb9293c12101db725d739338c13dd58e130d7024bf7b8bb915e330fe74bebe5cb",
  navxCoinMintFunctionTarget: `${PACKAGE}::navx::mint`,
  // Quiz
  quizObjectType: `${PACKAGE}::quiz::Quiz<${PACKAGE}::uni::UNI>`,
  quizTrackedObject:
    "0x52d3338e886c35f0bd921405357f2530f279dc7e10244fcf5d4807e0d5a1b4a8",
  quizMintFunctionTarget: `${PACKAGE}::quiz::mint_to_sender`,
  quizPassFunctionTarget: `${PACKAGE}::quiz::pass`,
  quizGetUserQuizzesFunctionTarget: `${PACKAGE}::quiz::get_user_quizzes`,
};
