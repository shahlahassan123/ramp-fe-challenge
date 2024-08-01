import { useCallback, useState } from "react"
import { useCustomFetch } from "src/hooks/useCustomFetch"
import { SetTransactionApprovalParams, Transaction } from "src/utils/types"
import { TransactionPane } from "./TransactionPane"
import { SetTransactionApprovalFunction, TransactionsComponent } from "./types"

export const Transactions: TransactionsComponent = ({ transactions }) => {
  const { fetchWithoutCache, loading } = useCustomFetch()
  const [updatedTransactions, setUpdatedTransactions] = useState(new Map<string, boolean>())

   // Set the approval status of a transaction
  const setTransactionApproval = useCallback<SetTransactionApprovalFunction>(
    async ({ transactionId, newValue }) => {
      await fetchWithoutCache<void, SetTransactionApprovalParams>("setTransactionApproval", {
        transactionId,
        value: newValue,
      })
      setUpdatedTransactions((prev) => new Map(prev).set(transactionId, newValue))
    },
    [fetchWithoutCache]
  )

  if (transactions === null) {
    return <div className="RampLoading--container">Loading...</div>
  }


  // Get the approval state of a transaction, considering local updates
  const getApprovalState = (transaction: Transaction) => {
    return updatedTransactions.has(transaction.id)
      ? updatedTransactions.get(transaction.id)!
      : transaction.approved
  }

  return (
    <div data-testid="transaction-container">
      {transactions.map((transaction) => (
        <TransactionPane
          key={transaction.id}
          transaction={{ ...transaction, approved: getApprovalState(transaction) }}
          loading={loading}
          setTransactionApproval={setTransactionApproval}
        />
      ))}
    </div>
  )
}
