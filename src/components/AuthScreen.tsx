import React, { useState } from "react";
import { Users, Mail, Lock, User, ArrowRight, Shield } from "lucide-react";
import { Citizen } from "../types";

interface AuthScreenProps {
  onLogin: (citizen: Citizen) => void;
  onRegister: (citizenData: {
    name: string;
    email: string;
    role: "citizen" | "official";
    password?: string;
  }) => void;
  onGuestLogin: () => void;
  citizens: Citizen[];
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onLogin,
  onRegister,
  onGuestLogin,
  citizens,
}) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"citizen" | "official">("citizen");
  const [officialPin, setOfficialPin] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (isLogin) {
      // Find user by email (mocking auth) or fallback to name for backward compatibility with initial data
      const user = citizens.find(
        (c) =>
          c.email?.toLowerCase().trim() === trimmedEmail ||
          c.name.toLowerCase().replace(" ", ".") + "@civic.com" ===
            trimmedEmail,
      );

      if (user) {
        if (trimmedPassword) {
          if (user.password && user.password === trimmedPassword) {
            onLogin(user);
          } else {
            setError("Incorrect password.");
          }
        } else {
          setError("Please enter your password.");
        }
      } else {
        setError("User not found. Please register.");
      }
    } else {
      if (!name || !email || !password) {
        setError("Please fill in all fields.");
        return;
      }

      if (role === "official" && !officialPin) {
        setError("Please enter your 6-digit Official ID (PIN).");
        return;
      }

      // Check if email already exists
      if (
        citizens.some((c) => c.email?.toLowerCase() === email.toLowerCase())
      ) {
        setError("Email already exists. Please login.");
        return;
      }

      onRegister({
        name,
        email,
        role,
        password,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center text-blue-600 mb-6">
          <Users size={48} />
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-2">
          Civic Connect
        </h2>
        <p className="text-center text-sm text-gray-600 mb-8">
          {isLogin
            ? "Welcome back to your community"
            : "Join your local community"}
        </p>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="John Doe"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-blue-500 focus:border-blue-500"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-blue-500 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I am a...
                </label>
                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={() => setRole("citizen")}
                    className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium flex items-center justify-center ${
                      role === "citizen"
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("official")}
                    className={`flex-1 py-2 px-4 rounded-md border text-sm font-medium flex items-center justify-center ${
                      role === "official"
                        ? "bg-blue-50 border-blue-200 text-blue-700"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Official
                  </button>
                </div>
              </div>
            )}

            {!isLogin && role === "official" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Official ID (6-digit PIN)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Shield className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={officialPin}
                    onChange={(e) =>
                      setOfficialPin(e.target.value.replace(/\D/g, ""))
                    }
                    className="block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border focus:ring-blue-500 focus:border-blue-500"
                    placeholder="123456"
                    maxLength={6}
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md border border-red-100">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  {isLogin
                    ? "New to Civic Connect?"
                    : "Already have an account?"}
                </span>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                }}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isLogin ? "Create an account" : "Sign in instead"}
              </button>

              <div className="relative mt-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <button
                onClick={onGuestLogin}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-2"
              >
                Continue as Guest
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
