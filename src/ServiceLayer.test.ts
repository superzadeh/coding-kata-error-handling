import { Either } from 'fp-ts/lib/Either'

import { CannotConnect, RemoteBankClient, Transaction } from './RemoteBankClient'
import {
  DepositError,
  NegativeAmountError,
  ServiceLayer,
  ServiceLayerParams
} from './ServiceLayer'

describe('Making Transactions', () => {
  it('should fail if the bank is not reachable when making the transaction', async () => {
    // Arrange
    const cannotConnectError = new CannotConnect('The bank is gone my friend')
    const stubRemoteBankClient: RemoteBankClient = {
      getTransactionById: jest.fn(),
      makeTransaction: () => {
        throw cannotConnectError
      }
    }
    const sut = new ServiceLayer({
      remoteBankClient: stubRemoteBankClient
    } as ServiceLayerParams)
    const amount: number = 15

    // Act
    const errorOrTransaction: Either<DepositError, Transaction> = await sut.deposit(
      amount
    )

    // Assert
    expect(errorOrTransaction.isLeft()).toBe(true)
    expect(errorOrTransaction.value).toEqual(cannotConnectError)
  })

  it('should fail if the bank is not reachable when getting the transaction', async () => {
    // Arrange
    const cannotConnectError = new CannotConnect('The bank is gone my friend')
    const stubRemoteBankClient: RemoteBankClient = {
      getTransactionById: () => {
        throw cannotConnectError
      },
      makeTransaction: jest.fn()
    }
    const sut = new ServiceLayer({
      remoteBankClient: stubRemoteBankClient
    } as ServiceLayerParams)
    const amount: number = 15

    // Act
    const errorOrTransaction: Either<DepositError, Transaction> = await sut.deposit(
      amount
    )

    // Assert
    expect(errorOrTransaction).toBe(cannotConnectError)
  })

  it('should not allow to deposit negative amounts', async () => {
    // Arrange
    const amount: number = -20
    const stubRemoteBankClient: RemoteBankClient = {
      getTransactionById: jest.fn(),
      makeTransaction: jest.fn()
    }
    const sut = new ServiceLayer({
      remoteBankClient: stubRemoteBankClient
    } as ServiceLayerParams)

    // Act
    const errorOrTransaction: Either<DepositError, Transaction> = await sut.deposit(
      amount
    )

    // Assert
    expect(errorOrTransaction).toBeInstanceOf(NegativeAmountError)
  })

  it('should successfully make a deposit', async () => {
    // Arrange
    const transactionId = '12345XYZ'
    const expectedTransaction: Transaction = {
      amount: 10,
      balanceBefore: 0,
      balanceAfter: 10,
      id: transactionId
    }
    const stubRemoteBankClient: RemoteBankClient = {
      makeTransaction: jest.fn().mockResolvedValue(transactionId),
      getTransactionById: () => Promise.resolve(expectedTransaction)
    }
    const sut = new ServiceLayer({
      remoteBankClient: stubRemoteBankClient
    } as ServiceLayerParams)

    // Act
    const actualTransaction = await sut.deposit(expectedTransaction.amount)

    // Assert
    expect(actualTransaction).toEqual(expectedTransaction)
    expect(stubRemoteBankClient.makeTransaction).toHaveBeenCalledWith(
      expectedTransaction.amount
    )
  })
})
