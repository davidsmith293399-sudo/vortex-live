import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

// Pre-seeded database of registered user accounts
const INITIAL_REGISTERED_USERS = [
  {
    id: 'usr_reg_1',
    name: 'Alex Rivera',
    email: 'alex.rivera@gmail.com',
    phone: '+14155552671',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    provider: 'gmail',
    tag: '#1001',
    verified: true,
  },
  {
    id: 'usr_reg_2',
    name: 'Tanvir Ahmed',
    email: 'tanvir.bd@gmail.com',
    phone: '+8801712345678', // Bangladesh demo
    password: 'bangladesh2026',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    provider: 'phone',
    tag: '#8801',
    verified: true,
  },
  {
    id: 'usr_reg_3',
    name: 'Rahul Sharma',
    email: 'rahul.india@gmail.com',
    phone: '+919876543210', // India demo
    password: 'india2026',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    provider: 'phone',
    tag: '#9101',
    verified: true,
  },
  {
    id: 'usr_reg_4',
    name: 'Sarah Chen',
    email: 'sarah.chen@gmail.com',
    phone: '+14155558989',
    password: 'vortex2026',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    provider: 'gmail',
    tag: '#2048',
    verified: true,
  }
];

export const AuthProvider = ({ children }) => {
  // Registered user accounts database in memory
  const [registeredUsers, setRegisteredUsers] = useState(INITIAL_REGISTERED_USERS);

  // Active generated verification codes { target: { code, expiresAt } }
  const [activeCodes, setActiveCodes] = useState({});

  // Active authenticated session user (starts null so user sees the login/signup screen)
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Helper to generate a 6-digit numeric verification code
  const generate6DigitCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // 1. Send Verification Code to Gmail
  const sendEmailVerificationCode = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const code = generate6DigitCode();
    
    setActiveCodes(prev => ({
      ...prev,
      [normalizedEmail]: {
        code,
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
      }
    }));

    return {
      success: true,
      code,
      message: `Verification code sent to ${normalizedEmail}`,
    };
  };

  // 2. Sign Up with Gmail + Verification Code + Password
  const signUpWithEmail = async ({ email, password, name, code }) => {
    setAuthLoading(true);
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = registeredUsers.find(u => u.email?.toLowerCase() === normalizedEmail);
    if (existing) {
      setAuthLoading(false);
      return {
        success: false,
        error: 'An account with this Gmail address already exists. Please log in instead.',
      };
    }

    // Verify verification code
    const stored = activeCodes[normalizedEmail];
    if (!stored || stored.code !== code.trim()) {
      setAuthLoading(false);
      return {
        success: false,
        error: 'Invalid or expired verification code. Please check your email or request a new code.',
      };
    }

    // Create new registered account
    const username = name?.trim() || normalizedEmail.split('@')[0] || 'VortexUser';
    const newUser = {
      id: `usr_${Date.now()}`,
      name: username.charAt(0).toUpperCase() + username.slice(1),
      email: normalizedEmail,
      password: password.trim(),
      avatar: null,
      provider: 'gmail',
      tag: `#${Math.floor(1000 + Math.random() * 9000)}`,
      verified: true,
      dataSaverMode: true,
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setAuthLoading(false);

    return { success: true, user: newUser };
  };

  // 3. Log In with Gmail and Password (EXACT MATCHING REQUIRED)
  const signInWithEmail = async ({ email, password }) => {
    setAuthLoading(true);
    const normalizedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Find account by Gmail
    const user = registeredUsers.find(u => u.email?.toLowerCase() === normalizedEmail);

    if (!user) {
      setAuthLoading(false);
      return {
        success: false,
        error: 'No account found with this Gmail address. Please check your spelling or sign up.',
      };
    }

    // Exact Password Matching
    if (user.password !== cleanPassword) {
      setAuthLoading(false);
      return {
        success: false,
        error: 'Incorrect password for this Gmail account. Please enter the exact password you registered with.',
      };
    }

    // Login successful
    setCurrentUser(user);
    setIsAuthenticated(true);
    setAuthLoading(false);

    return { success: true, user };
  };

  // 4. Send SMS OTP to Phone Number
  const sendPhoneOTP = async ({ phone, dialCode }) => {
    const fullPhone = `${dialCode}${phone.trim().replace(/\D/g, '')}`;
    const code = generate6DigitCode();

    setActiveCodes(prev => ({
      ...prev,
      [fullPhone]: {
        code,
        expiresAt: Date.now() + 10 * 60 * 1000,
      }
    }));

    return {
      success: true,
      code,
      fullPhone,
      message: `OTP sent to ${fullPhone}`,
    };
  };

  // 5. Sign Up with Phone Number + OTP Code + Password
  const signUpWithPhone = async ({ phone, dialCode, countryName, password, name, otpCode }) => {
    setAuthLoading(true);
    const fullPhone = `${dialCode}${phone.trim().replace(/\D/g, '')}`;

    // Check if phone already registered
    const existing = registeredUsers.find(u => u.phone === fullPhone);
    if (existing) {
      setAuthLoading(false);
      return {
        success: false,
        error: 'This phone number is already registered. Please log in instead.',
      };
    }

    // Verify OTP code
    const stored = activeCodes[fullPhone];
    if (!stored || stored.code !== otpCode.trim()) {
      setAuthLoading(false);
      return {
        success: false,
        error: 'Invalid or expired phone OTP code. Please verify the 6-digit code sent to your phone.',
      };
    }

    // Create new registered phone account
    const username = name?.trim() || `User_${fullPhone.slice(-4)}`;
    const newUser = {
      id: `usr_phone_${Date.now()}`,
      name: username,
      phone: fullPhone,
      country: countryName,
      password: password.trim(),
      avatar: null,
      provider: 'phone',
      tag: `#${Math.floor(1000 + Math.random() * 9000)}`,
      verified: true,
      dataSaverMode: true,
    };

    setRegisteredUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setAuthLoading(false);

    return { success: true, user: newUser };
  };

  // 6. Log In with Phone Number (Password or OTP)
  const signInWithPhone = async ({ phone, dialCode, password, otpCode, loginMethod }) => {
    setAuthLoading(true);
    const fullPhone = `${dialCode}${phone.trim().replace(/\D/g, '')}`;

    if (loginMethod === 'otp') {
      // Login via OTP
      const stored = activeCodes[fullPhone];
      if (!stored || stored.code !== (otpCode || '').trim()) {
        setAuthLoading(false);
        return {
          success: false,
          error: 'Invalid or expired phone OTP code. Please enter the correct code.',
        };
      }

      // Check if user exists or auto-register
      let user = registeredUsers.find(u => u.phone === fullPhone);
      if (!user) {
        user = {
          id: `usr_phone_${Date.now()}`,
          name: `User ${fullPhone.slice(-4)}`,
          phone: fullPhone,
          password: 'phone_otp_auth',
          provider: 'phone',
          tag: `#${Math.floor(1000 + Math.random() * 9000)}`,
          verified: true,
          dataSaverMode: true,
        };
        setRegisteredUsers(prev => [...prev, user]);
      }

      setCurrentUser(user);
      setIsAuthenticated(true);
      setAuthLoading(false);
      return { success: true, user };
    } else {
      // Login via Password
      const user = registeredUsers.find(u => u.phone === fullPhone);
      if (!user) {
        setAuthLoading(false);
        return {
          success: false,
          error: 'No account found with this phone number. Please sign up or log in using SMS OTP.',
        };
      }

      if (user.password !== password.trim()) {
        setAuthLoading(false);
        return {
          success: false,
          error: 'Incorrect password for this phone number. Please enter the exact password or use OTP login.',
        };
      }

      setCurrentUser(user);
      setIsAuthenticated(true);
      setAuthLoading(false);
      return { success: true, user };
    }
  };

  // 7. Single-Sign-On: Continue with Google
  const signInWithGoogle = async () => {
    setAuthLoading(true);
    setTimeout(() => {
      const user = {
        id: `usr_google_${Date.now()}`,
        name: 'Alex Rivera',
        email: 'alex.rivera@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
        provider: 'google',
        tag: '#1001',
        verified: true,
        dataSaverMode: true,
      };
      setCurrentUser(user);
      setIsAuthenticated(true);
      setAuthLoading(false);
    }, 600);
  };

  // 8. Single-Sign-On: Continue with Facebook
  const signInWithFacebook = async () => {
    setAuthLoading(true);
    setTimeout(() => {
      const user = {
        id: `usr_fb_${Date.now()}`,
        name: 'Jordan Miller',
        email: 'jordan.miller@facebook.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
        provider: 'facebook',
        tag: '#3042',
        verified: true,
        dataSaverMode: true,
      };
      setCurrentUser(user);
      setIsAuthenticated(true);
      setAuthLoading(false);
    }, 600);
  };

  // 9. Single-Sign-On: Continue with Microsoft
  const signInWithMicrosoft = async () => {
    setAuthLoading(true);
    setTimeout(() => {
      const user = {
        id: `usr_ms_${Date.now()}`,
        name: 'Elena Rostova',
        email: 'elena.rostova@outlook.com',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
        provider: 'microsoft',
        tag: '#5096',
        verified: true,
        dataSaverMode: true,
      };
      setCurrentUser(user);
      setIsAuthenticated(true);
      setAuthLoading(false);
    }, 600);
  };

  // 10. Single-Sign-On: Continue with Apple
  const signInWithApple = async () => {
    setAuthLoading(true);
    setTimeout(() => {
      const user = {
        id: `usr_apple_${Date.now()}`,
        name: 'Taylor Swift',
        email: 'taylor.privaterelay@appleid.com',
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
        provider: 'apple',
        tag: '#9901',
        verified: true,
        dataSaverMode: true,
      };
      setCurrentUser(user);
      setIsAuthenticated(true);
      setAuthLoading(false);
    }, 600);
  };

  // Sign Out
  const signOut = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        authLoading,
        registeredUsers,
        sendEmailVerificationCode,
        signUpWithEmail,
        signInWithEmail,
        sendPhoneOTP,
        signUpWithPhone,
        signInWithPhone,
        signInWithGoogle,
        signInWithFacebook,
        signInWithMicrosoft,
        signInWithApple,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
