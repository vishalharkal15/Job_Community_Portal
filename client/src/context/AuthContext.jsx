import { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../firebase/firebaseConfig'
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  // Determine user role based on email or Firestore data
  const getUserRole = async (user) => {
    try {
      // Try to get role from Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        return userDoc.data().role
      }
      
      // Fallback: determine role based on email
      const email = user.email.toLowerCase()
      if (email.includes('company') || email.includes('corp')) {
        return 'company'
      } else if (email.includes('recruiter') || email.includes('hr')) {
        return 'recruiter'
      }
      return 'user'
    } catch (error) {
      console.error('Error getting user role:', error)
      return 'user'
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)
      if (user) {
        const role = await getUserRole(user)
        setUserRole(role)
      } else {
        setUserRole(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signUp = async (email, password, displayName, role = 'user') => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName })
    
    // Save user role to Firestore
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      email,
      displayName,
      role,
      createdAt: new Date()
    })
    
    return userCredential
  }

  const signIn = async (email, password) => {
    return signInWithEmailAndPassword(auth, email, password)
  }

  const signOut = async () => {
    return firebaseSignOut(auth)
  }

  const value = {
    currentUser,
    userRole,
    signUp,
    signIn,
    signOut,
    canEditBlog: () => userRole === 'company' || userRole === 'recruiter'
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
