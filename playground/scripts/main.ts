async function main() {
  console.log("Starting script...");

  console.log("Script finished");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
