interface Transaction {
  readonly id: string
  readonly balanceBefore: number
  readonly amount: number
  readonly balanceAfter: number
}

class NotEnoughFounds extends Error {
  public accountId: string
}
class CannotConnect extends Error {
  public status: number
}
class AccountBlocked extends Error {
  public accountId: string
}
class TransactionNotFound extends Error {
  public transactionId: string
}

type TransactionError = NotEnoughFounds | CannotConnect | AccountBlocked | TransactionNotFound

abstract class RemoteBankClient {
  public abstract makeTransaction(cents: number): Promise<string>
  public abstract getTransactionById(transactionId: string): Promise<Transaction>
}

export {
  TransactionError,
  NotEnoughFounds,
  TransactionNotFound,
  CannotConnect,
  AccountBlocked,
  RemoteBankClient,
  Transaction,
}
