import { useCallback, useState } from "react"
import { fakeFetch } from "../utils/fetch"
import { Employee } from "../utils/types"

export function useEmployees() {
  const [employees, setEmployees] = useState<Employee[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const data = await fakeFetch<Employee[], {}>("employees", {}) // Provide an empty object as params
    setEmployees(data)
    setLoading(false)
  }, [])

  return { data: employees, loading, fetchAll }
}
