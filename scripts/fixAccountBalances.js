import { AppDataSource } from "../src/data-source";
import { Account } from "../src/entities/Account";

async function fixAccountBalances() {
  try {
    await AppDataSource.initialize();
    const accountRepository = AppDataSource.getRepository(Account);

    const accounts = await accountRepository.find();

    console.log("Accounts before fix:");
    accounts.forEach((account) => {
      console.log(
        `ID: ${account.id}, Type: ${account.type}, Balance: ${account.balance}`
      );
    });

    for (const account of accounts) {
      if (isNaN(account.balance)) {
        // Set a default balance of 0 for accounts with NaN balance
        account.balance = 0;
        await accountRepository.save(account);
        console.log(`Fixed account ${account.id}: Set balance to 0`);
      }
    }

    const fixedAccounts = await accountRepository.find();

    console.log("\nAccounts after fix:");
    fixedAccounts.forEach((account) => {
      console.log(
        `ID: ${account.id}, Type: ${account.type}, Balance: ${account.balance}`
      );
    });
  } catch (error) {
    console.error("Error fixing account balances:", error);
  } finally {
    await AppDataSource.destroy();
  }
}

fixAccountBalances();
