'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LogoutButton() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Déconnexion de l'utilisateur via Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Rafraîchit la page actuelle pour mettre à jour l'état de l'interface
      router.refresh()
      // Optionnel : rediriger l'utilisateur vers la page de connexion
      // router.push('/login')
    } catch (error) {
      console.error('Erreur lors de la déconnexion :', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
    >
      Déconnexion
    </button>
  )
}
