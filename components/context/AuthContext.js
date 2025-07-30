import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client'; // Replaced useApp with useUser

/**
 * @module AuthContext
 * @description Provides authentication context for the Learner/Parent portal.
 * This context manages the user's login status and provides a signOut function.
 * It leverages Auth0 for authentication.
 */

/**
 * @constant AuthContext
 * @description React Context object for authentication. Consumers can use this context
 * to access the authentication state and functions.
 */
const AuthContext = createContext();

/**
 * @function AuthProvider
 * @description React Component that serves as the provider for the AuthContext.
 * It manages the authentication state (`isLoggedIn`) and provides methods (`signOut`)
 * to its children components.
 * @param {object} props - The properties passed to the component.
 * @param {React.ReactNode} props.children - The child components that will consume this context.
 */
export const AuthProvider = ({ children }) => {
  // Use Auth0's useUser hook to get user authentication state
  const { user, isLoading, error, logout } = useUser();

  // isLoggedIn state is now derived from the Auth0 user object
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  /**
   * @useEffect
   * @description Effect hook to check the user's login status when the component mounts
   * or when the `user` or `isLoading` state from Auth0 changes.
   * It updates the `isLoggedIn` state accordingly.
   * @dependency [user, isLoading] - Re-runs when the Auth0 user or loading status changes.
   */
  useEffect(() => {
    // A user is considered logged in if the user object exists and is not currently loading
    setIsLoggedIn(!!user && !isLoading);
  }, [user, isLoading]);

  /**
   * @function signOut
   * @description Asynchronously logs out the current user using Auth0's logout function.
   * After successful logout, the `isLoggedIn` state will automatically update via the useEffect.
   * @returns {Promise<void>}
   */
  const signOut = async () => {
    try {
      // Call Auth0's logout function
      await logout({ returnTo: window.location.origin });
      // The useEffect will handle updating isLoggedIn based on the user state change
    } catch (err) {
      console.error("ERROR: AuthContext - Error during sign out:", err);
      // Optionally show a toast notification for the error
    }
  };

  // Provide the authentication state and functions to child components.
  return (
    <AuthContext.Provider value={{ isLoggedIn, signOut, user, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * @function useAuth
 * @description Custom hook to consume the AuthContext.
 * This hook provides a convenient way for components to access the `isLoggedIn` state,
 * `signOut` function, and the `user`, `isLoading`, `error` objects from Auth0.
 * @returns {object} An object containing `isLoggedIn` (boolean), `signOut` (function),
 * `user` (Auth0 user object), `isLoading` (boolean), `error` (Auth0 error object).
 */
export const useAuth = () => useContext(AuthContext);
