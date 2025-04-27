"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Coins,
  Leaf,
  Search,
  Bell,
  User,
  ChevronDown,
  LogIn,
  Eye,
  EyeOff,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  createUser,
  getUnreadNotifications,
  markNotificationAsRead,
  getUserByEmail,
  getUserBalance,
} from "@/utils/db/actions";
import bcrypt from "bcryptjs";

interface HeaderProps {
  onMenuClick: () => void;
  totalEarnings?: number;
}

interface AuthState {
  email: string;
  name: string;
  password: string;
  role: string;
  emailError?: string;
  nameError?: string;
  passwordError?: string;
  roleError?: string;
  formError?: string;
  isSignUp?: boolean;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const pathname = usePathname();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authState, setAuthState] = useState<AuthState>({
    email: "",
    name: "",
    password: "",
    role: "reporter",
    emailError: "",
    nameError: "",
    passwordError: "",
    roleError: "",
    formError: "",
    isSignUp: true,
  });

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const email = localStorage.getItem("userEmail");
        if (email) {
          const user = await getUserByEmail(email);
          if (user) {
            setUserInfo(user);
            setLoggedIn(true);
          }
        }
      } catch (error) {
        console.error("Session initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    initializeSession();
  }, []);

  useEffect(() => {
    if (!userInfo) return;

    const fetchData = async () => {
      try {
        const [unread, bal] = await Promise.all([
          getUnreadNotifications(userInfo.id),
          getUserBalance(userInfo.id),
        ]);
        setNotifications(unread || []);
        setBalance(bal || 0);
      } catch (error) {
        console.error("Error fetching notifications/balance:", error);
      }
    };

    fetchData();
    const notificationInterval = setInterval(fetchData, 30000);
    return () => clearInterval(notificationInterval);
  }, [userInfo]);

  const validateForm = (): boolean => {
    let isValid = true;
    const newState: AuthState = { ...authState };

    // Email validation
    if (!newState.email) {
      newState.emailError = "Email is required";
      isValid = false;
    } else if (!/^[a-z0-9._%+-]+@[a-z]+\.[a-z]{2,}$/.test(newState.email)) {
      newState.emailError =
        "Please enter a valid lowercase email (e.g., user@example.com)";
      isValid = false;
    } else {
      newState.emailError = "";
    }

    // Name validation (only for sign up)
    if (newState.isSignUp) {
      if (!newState.name.trim()) {
        newState.nameError = "Name is required";
        isValid = false;
      } else if (newState.name.length < 2) {
        newState.nameError = "Name must be at least 2 characters";
        isValid = false;
      } else {
        newState.nameError = "";
      }

      // Role validation
      if (!newState.role) {
        newState.roleError = "Please select a role";
        isValid = false;
      } else {
        newState.roleError = "";
      }
    }

    // Password validation
    if (!newState.password) {
      newState.passwordError = "Password is required";
      isValid = false;
    } else if (newState.password.length < 6) {
      newState.passwordError = "Password must be at least 6 characters";
      isValid = false;
    } else {
      newState.passwordError = "";
    }

    setAuthState(newState);
    return isValid;
  };

  const handleAuthSubmit = async () => {
    if (!validateForm()) return;

    const { email, name, password, role, isSignUp } = authState;

    try {
      setLoading(true);
      setAuthState((prev) => ({ ...prev, formError: "" }));

      if (isSignUp) {
        // Sign up flow
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
          throw new Error("Email already exists. Please log in instead.");
        }

        const newUser = await createUser({
          email,
          name,
          password,
          role,
        });

        if (!newUser) {
          throw new Error("Signup failed. Please try again.");
        }
        completeLogin(newUser);
      } else {
        // Login flow
        const user = await getUserByEmail(email);
        if (!user) {
          throw new Error("Email not found. Please sign up first.");
        }
        if (!user.password_Hash) {
          throw new Error(
            "Invalid account configuration. Please contact support."
          );
        }

        const isValid = await bcrypt.compare(password, user.password_Hash);
        if (!isValid) {
          throw new Error("Invalid password. Please try again.");
        }
        completeLogin(user);
      }
    } catch (err: any) {
      setAuthState((prev) => ({
        ...prev,
        formError: err.message || "An error occurred. Please try again.",
      }));
    } finally {
      setLoading(false);
    }
  };

  const completeLogin = (user: any) => {
    setUserInfo(user);
    setLoggedIn(true);
    localStorage.setItem("userEmail", user.email);
    setShowAuthModal(false);
    setAuthState({
      email: "",
      name: "",
      password: "",
      role: "reporter",
      emailError: "",
      nameError: "",
      passwordError: "",
      roleError: "",
      formError: "",
      isSignUp: true,
    });
    setShowPassword(false);
  };

  const toggleAuthMode = () => {
    setAuthState((prev) => ({
      ...prev,
      isSignUp: !prev.isSignUp,
      formError: "",
      emailError: "",
      nameError: "",
      passwordError: "",
      roleError: "",
    }));
    setShowPassword(false);
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setUserInfo(null);
    localStorage.removeItem("userEmail");
  };

  const handleNotificationClick = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <span className="text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="flex items-center justify-between px-4 py-2 relative">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={onMenuClick}>
            <Menu className="h-6 w-6" />
          </Button>
          <Link href="/" className="flex items-center ml-2">
            <Leaf className="h-6 w-6 text-green-500 mr-2" />
            <span className="font-bold text-lg text-gray-800">Zero2Hero</span>
          </Link>
        </div>

        {!isMobile && (
          <div className="flex-1 max-w-xl mx-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        )}

        <div className="flex items-center relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notifications.length > 0 && (
                  <Badge className="absolute -top-1 -right-1 px-1">
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              {notifications.length > 0 ? (
                notifications.map((n: any) => (
                  <DropdownMenuItem
                    key={n.id}
                    onClick={() => handleNotificationClick(n.id)}
                  >
                    <div>
                      <p className="font-medium">{n.type}</p>
                      <p className="text-sm text-gray-500">{n.message}</p>
                    </div>
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem>No new notifications</DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="bg-gray-100 rounded-full px-3 py-1 mx-2">
            <Coins className="h-4 w-4 text-green-500 mr-1 inline" />
            <span className="font-semibold text-sm text-gray-800">
              {balance.toFixed(2)}
            </span>
          </div>

          {!loggedIn ? (
            <>
              <Button
                onClick={() => setShowAuthModal(true)}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                Login / Sign Up
                <LogIn className="ml-2 h-4 w-4" />
              </Button>

              {showAuthModal && (
                <div className="absolute top-14 right-0 bg-white border border-gray-200 shadow-lg rounded-lg w-80 z-50 p-4">
                  <h2 className="text-lg font-semibold mb-3">
                    {authState.isSignUp ? "Create Account" : "Welcome Back"}
                  </h2>

                  {authState.formError && (
                    <div className="mb-3 p-2 bg-red-100 text-red-700 text-sm rounded">
                      {authState.formError}
                    </div>
                  )}

                  <div className="mb-2">
                    <input
                      type="email"
                      placeholder="Email"
                      className={`w-full border p-2 rounded ${
                        authState.emailError
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      value={authState.email}
                      onChange={(e) =>
                        setAuthState({
                          ...authState,
                          email: e.target.value.toLowerCase(),
                          emailError: "",
                          formError: "",
                        })
                      }
                      onBlur={() => validateForm()}
                    />
                    {authState.emailError && (
                      <p className="text-red-500 text-xs mt-1">
                        {authState.emailError}
                      </p>
                    )}
                  </div>

                  {authState.isSignUp && (
                    <>
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder="Name"
                          className={`w-full border p-2 rounded ${
                            authState.nameError
                              ? "border-red-500"
                              : "border-gray-300"
                          }`}
                          value={authState.name}
                          onChange={(e) =>
                            setAuthState({
                              ...authState,
                              name: e.target.value,
                              nameError: "",
                              formError: "",
                            })
                          }
                          onBlur={() => validateForm()}
                        />
                        {authState.nameError && (
                          <p className="text-red-500 text-xs mt-1">
                            {authState.nameError}
                          </p>
                        )}
                      </div>

                      <div className="mb-2">
                        <div className="flex flex-col space-y-2">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              className="form-radio h-4 w-4 text-green-600"
                              name="role"
                              value="reporter"
                              checked={authState.role === "reporter"}
                              onChange={(e) =>
                                setAuthState({
                                  ...authState,
                                  role: e.target.value,
                                  roleError: "",
                                })
                              }
                            />
                            <span>Waste Reporter</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              className="form-radio h-4 w-4 text-green-600"
                              name="role"
                              value="collector"
                              checked={authState.role === "collector"}
                              onChange={(e) =>
                                setAuthState({
                                  ...authState,
                                  role: e.target.value,
                                  roleError: "",
                                })
                              }
                            />
                            <span>Waste Collector</span>
                          </label>
                        </div>
                        {authState.roleError && (
                          <p className="text-red-500 text-xs mt-1">
                            {authState.roleError}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="mb-3 relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      className={`w-full border p-2 rounded ${
                        authState.passwordError
                          ? "border-red-500"
                          : "border-gray-300"
                      } pr-10`}
                      value={authState.password}
                      onChange={(e) =>
                        setAuthState({
                          ...authState,
                          password: e.target.value,
                          passwordError: "",
                          formError: "",
                        })
                      }
                      onBlur={() => validateForm()}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    {authState.passwordError && (
                      <p className="text-red-500 text-xs mt-1">
                        {authState.passwordError}
                      </p>
                    )}
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <button
                      type="button"
                      onClick={toggleAuthMode}
                      className="text-sm text-green-600 hover:underline"
                    >
                      {authState.isSignUp
                        ? "Already have an account? Log in"
                        : "Need an account? Sign up"}
                    </button>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      onClick={handleAuthSubmit}
                      className="bg-green-600 text-white hover:bg-green-700"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="animate-spin mr-2">↻</span>
                          Processing...
                        </>
                      ) : authState.isSignUp ? (
                        "Sign Up"
                      ) : (
                        "Log In"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAuthModal(false);
                        setShowPassword(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1">
                  <User className="h-5 w-5" />
                  <span className="hidden md:inline">{userInfo?.name}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  <div className="flex flex-col">
                    {/* <span>{userInfo?.email}</span> */}
                    <span className="text-s text-gray-500 capitalize">
                      {userInfo?.role || "reporter"}
                    </span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
