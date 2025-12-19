// ... imports ...
import { createContext, useContext, useEffect, useState } from "react";
// Supabase User type removed // Keeping type for now or better define our own
import api from "@/lib/api"; // Import the new API helper
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Define strict types for our User
interface User {
  id: string; // Add id
  _id: string;
  fullName: string;
  email: string;
  role: "client" | "broker" | "admin";
  token?: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  location?: string;
}

interface AuthContextType {
  user: User | null;
  // session: Session | null; // Removed session
  signUp: (email: string, password: string, fullName: string, role?: "client" | "broker" | "admin") => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
  signOut: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: "client" | "broker" | "admin" = "client") => {
    try {
      const response = await api.post('/auth/signup', {
        email,
        password,
        fullName,
        role
      });

      const loggedInUser = { ...response.data, id: response.data._id };
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      toast.success("Account created successfully!");

      // Redirect logic
      if (loggedInUser.role === 'admin') navigate('/admin-dashboard');
      else if (loggedInUser.role === 'broker') navigate('/broker-dashboard');
      else navigate('/client-dashboard');

    } catch (error: any) {
      console.error(error);
      throw new Error(error.response?.data?.message || 'Signup failed');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });

      const loggedInUser = { ...response.data, id: response.data._id };
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      toast.success("Welcome back!");

      // Redirect logic
      if (loggedInUser.role === 'admin') navigate('/admin-dashboard');
      else if (loggedInUser.role === 'broker') navigate('/broker-dashboard');
      else navigate('/client-dashboard');

    } catch (error: any) {
      console.error(error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  const updateUser = (updatedUser: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const newUser = { ...prev, ...updatedUser };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  const signOut = async () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    toast.success("Signed out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, signUp, signIn, updateUser, signOut, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
