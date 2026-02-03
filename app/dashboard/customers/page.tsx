import { DataTable } from '@/components/dashboard/data-table'
import React from 'react'

function Page() {
  return (
    <div className='p-4 space-y-6'>
      <h1 className='text-2xl font-bold'>Customers List</h1>
      <DataTable columns={[
        { accessorKey: 'id', header: 'ID' },
        { accessorKey: 'name', header: 'Name' },
        { accessorKey: 'email', header: 'Email' },
      ]} data={[
        { id: 1, name: 'John Doe', email: 'xk0e0@example.com' },
        { id: 2, name: 'Jane Smith', email: 'NtZwv@example.com' },
      ]} />
    </div>
  )
}

export default Page