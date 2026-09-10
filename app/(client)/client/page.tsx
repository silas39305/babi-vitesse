import LogoutButton from '@/components/LogoutButton'

export default function ClientHome() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Espace Client</h1>
        <LogoutButton />
      </div>
    </div>
  );
}