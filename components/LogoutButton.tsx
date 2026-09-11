'use client'

import { supabase } from '@/lib/supabase/client'

export default function LogoutButton() {
  const handleLogout = async () => {
    try {
      // 1. Déconnexion stricte de la session Supabase
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // 2. Nettoyage manuel du stockage local (sécurité supplémentaire)
      if (typeof window !== 'undefined') {
        window.localStorage.clear()
        window.sessionStorage.clear()
        
        // 3. Forcer un rechargement complet du navigateur vers la page d'accueil ou connexion
        // Cela détruit instantanément le cache Next.js (RSC) qui bloquait l'affichage
        window.location.href = '/'
      }
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
