import { Either, left, Right, right } from 'fp-ts/lib/Either'
import { RemoteBankClient, Transaction, TransactionError } from './RemoteBankClient'

interface ServiceLayerParams {
  remoteBankClient: RemoteBankClient
}

class NegativeAmountError extends Error {
}

type DepositError = TransactionError | NegativeAmountError

class ServiceLayer {
  public remoteBankClient: RemoteBankClient

  constructor({ remoteBankClient } = {} as ServiceLayerParams) {
    this.remoteBankClient = remoteBankClient

    this.deposit = this.deposit.bind(this)
  }

  public async deposit(amount: number): Promise<Either<DepositError, Transaction>> {
    const { remoteBankClient } = this

    try {
      const transactionId = await remoteBankClient.makeTransaction(amount)
      const transaction = await remoteBankClient.getTransactionById(transactionId)
      return right(transaction)
    } catch (error) {
      return left(error)
    }
  }
}

export { ServiceLayer, ServiceLayerParams, DepositError, NegativeAmountError }
