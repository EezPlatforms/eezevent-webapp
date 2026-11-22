"use client";
import { CircularProgress } from '@mui/material';
import { useAuth } from '../lib/auth';
import { Navigate } from '../lib/navigation';
export default function BusinessOwnerGate({ children }) {
  const { auth, authReady, isAuthenticated } = useAuth();
  if (!authReady) return <CircularProgress aria-label="Loading account" />;
  if (!isAuthenticated) return <Navigate to="/login?account=vendor&next=%2Fbusiness-admin" replace />;
  if (auth?.userType !== 'vendor') return <Navigate to="/events" replace />;
  return children;
}
