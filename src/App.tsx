
import { Fragment, useCallback, useEffect, useMemo, useState } from "react"
import { InputSelect } from "./components/InputSelect"
import { Instructions } from "./components/Instructions"
import { Transactions } from "./components/Transactions"
import { useEmployees } from "./hooks/useEmployees"
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions"
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee"
import { EMPTY_EMPLOYEE } from "./utils/constants"
import { Employee } from "./utils/types"

export function App() {
  const { data: employees, loading: loadingEmployees, fetchAll: fetchAllEmployees } = useEmployees()
  const { data: paginatedTransactions, loading: loadingTransactions, fetchAll: fetchAllPaginatedTransactions, invalidateData: invalidatePaginatedTransactions } = usePaginatedTransactions()
  const { data: transactionsByEmployee, fetchById: fetchTransactionsByEmployee, invalidateData: invalidateTransactionsByEmployee } = useTransactionsByEmployee()
  const [isFiltered, setIsFiltered] = useState(false)

  // Combine paginated and transactions filtered by employee
  const transactions = useMemo(
    () => paginatedTransactions?.data ?? transactionsByEmployee ?? null,
    [paginatedTransactions, transactionsByEmployee]
  )

  // Load all transactions without any filter
  const loadAllTransactions = useCallback(async () => {
    invalidateTransactionsByEmployee()
    setIsFiltered(false)

    await fetchAllEmployees()
    await fetchAllPaginatedTransactions()
  }, [fetchAllEmployees, fetchAllPaginatedTransactions, invalidateTransactionsByEmployee])

  // Load transactions by employee
  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      invalidatePaginatedTransactions()
      setIsFiltered(true)
      await fetchTransactionsByEmployee(employeeId)
    },
    [invalidatePaginatedTransactions, fetchTransactionsByEmployee]
  )

  useEffect(() => {
    if (employees === null && !loadingEmployees) {
      loadAllTransactions()
    }
  }, [loadingEmployees, employees, loadAllTransactions])

  return (
 
    <Fragment>
  <main className="MainContainer">
    <Instructions />

    <hr className="RampBreak--l" />

    {/* InputSelect component to filter transactions by employee */}
    <InputSelect<Employee>
      isLoading={loadingEmployees} // Show loading state for employees only
      defaultValue={EMPTY_EMPLOYEE} // Default value for the dropdown
      items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]} // Items to display in the dropdown, including "All Employees"
      label="Filter by employee" // Label for the dropdown
      loadingLabel="Loading employees" // Loading label while fetching employees
      parseItem={(item) => ({
        value: item.id,
        label: item === EMPTY_EMPLOYEE ? "All Employees" : `${item.firstName} ${item.lastName}`, // Parse items to show the correct label
      })}
      onChange={async (newValue) => {
        if (newValue === null || newValue === EMPTY_EMPLOYEE) {
          // If "All Employees" is selected or the value is null, load all transactions
          await loadAllTransactions();
        } else {
          // If a specific employee is selected, load transactions for that employee
          await loadTransactionsByEmployee(newValue.id);
        }
      }}
    />

    <div className="RampBreak--l" />

    <div className="RampGrid">
      {/* Transactions component to display the list of transactions */}
      <Transactions transactions={transactions} />

      {/* "View More" button to load more transactions */}
      {transactions !== null && !isFiltered && paginatedTransactions?.nextPage !== null && (
        <button
          className="RampButton"
          disabled={loadingTransactions} // Disable the button while loading
          onClick={async () => {
            await fetchAllPaginatedTransactions(); // Fetch more transactions
          }}
        >
          View More
        </button>
      )}
    </div>
  </main>
</Fragment>

  )
}

