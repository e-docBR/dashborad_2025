import { getDashboardData } from './actions/get-dashboard-data'
import Dashboard from '@/components/Dashboard'
import AIChat from '@/components/AIChat'

export default async function Page() {
  const data = await getDashboardData()

  return (
    <>
      <Dashboard initialData={data} />
      <AIChat />
    </>
  )
}
