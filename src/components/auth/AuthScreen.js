import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '../../theme/colors';
import { useAuth } from '../../context/AuthContext';
import { COUNTRIES, DEFAULT_COUNTRY } from '../../constants/countries';

// Professional Visual Country Flag Component
// Renders high-resolution FlagCDN image with rounded border and emoji fallback
const CountryFlag = ({ country, size = 'md', style }) => {
  const [hasError, setHasError] = useState(false);

  const dim = size === 'sm'
    ? { width: 22, height: 15, borderRadius: 3 }
    : size === 'lg'
    ? { width: 34, height: 23, borderRadius: 4 }
    : { width: 26, height: 18, borderRadius: 3 }; // 'md' default

  if (!hasError && country?.flagUrl) {
    return (
      <View style={[styles.flagWrapper, dim, style]}>
        <Image
          source={{ uri: country.flagUrl }}
          style={styles.flagImageFill}
          resizeMode="cover"
          onError={() => setHasError(true)}
        />
      </View>
    );
  }

  return (
    <View style={[styles.flagWrapper, dim, styles.flagFallbackWrapper, style]}>
      <Text style={[styles.flagFallbackText, { fontSize: dim.height * 0.85 }]}>
        {country?.flag || '🏳️'}
      </Text>
    </View>
  );
};

export const AuthScreen = () => {
  const {
    signInWithGoogle,
    signInWithFacebook,
    signInWithMicrosoft,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    sendEmailVerificationCode,
    signInWithPhone,
    signUpWithPhone,
    sendPhoneOTP,
    registeredUsers,
    authLoading,
  } = useAuth();

  // Mode: 'login' | 'signup'
  const [authMode, setAuthMode] = useState('login');

  // Method: 'email' (Gmail) | 'phone'
  const [authMethod, setAuthMethod] = useState('email');

  // Email form states
  const [email, setEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailConfirmPassword, setEmailConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showEmailPassword, setShowEmailPassword] = useState(false);

  // Phone form states
  const [selectedCountry, setSelectedCountry] = useState(DEFAULT_COUNTRY);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phonePassword, setPhonePassword] = useState('');
  const [phoneLoginMethod, setPhoneLoginMethod] = useState('otp'); // 'otp' | 'password'
  const [showPhonePassword, setShowPhonePassword] = useState(false);
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [isPhoneFocused, setIsPhoneFocused] = useState(false);

  // Two-Step Verification State
  // null | { target: string, type: 'email' | 'phone', generatedCode: string, payload: any }
  const [verificationStep, setVerificationStep] = useState(null);
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // Simulated Push Notification Banner for Incoming SMS / Email Code
  const [simulatedNotification, setSimulatedNotification] = useState(null);

  // Error and feedback banner
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Demo accounts helper sheet
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  // Countdown timer for resending codes
  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(t => t - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Dismiss notification after 8 seconds
  useEffect(() => {
    let notifTimer;
    if (simulatedNotification) {
      notifTimer = setTimeout(() => setSimulatedNotification(null), 8000);
    }
    return () => clearTimeout(notifTimer);
  }, [simulatedNotification]);

  // ==========================================
  // GMAIL AUTHENTICATION WORKFLOWS
  // ==========================================

  // Step 1 of Gmail Sign-Up: Validate fields & send email verification code
  const handleInitiateEmailSignUp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!displayName.trim()) {
      setErrorMessage('Please enter your display name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid Gmail / email address.');
      return;
    }
    if (!emailPassword.trim() || emailPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (emailPassword !== emailConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    // Check if email already registered
    const alreadyExists = registeredUsers.some(
      u => u.email?.toLowerCase() === email.trim().toLowerCase()
    );
    if (alreadyExists) {
      setErrorMessage('This Gmail address is already registered. Please log in using this Gmail and password.');
      return;
    }

    // Generate and send verification code
    const res = await sendEmailVerificationCode(email);
    if (res.success) {
      setVerificationStep({
        type: 'email',
        target: email.trim().toLowerCase(),
        generatedCode: res.code,
        payload: {
          name: displayName.trim(),
          email: email.trim().toLowerCase(),
          password: emailPassword.trim(),
        },
      });
      setVerificationCodeInput('');
      setResendTimer(45);

      // Trigger simulated incoming email alert
      setSimulatedNotification({
        type: 'email',
        title: '📬 Vortex Security (Gmail Inbox)',
        body: `Your verification code is: ${res.code}. Valid for 10 minutes.`,
        code: res.code,
      });
    }
  };

  // Step 2 of Gmail Sign-Up: Verify code and complete registration
  const handleCompleteEmailSignUp = async () => {
    setErrorMessage('');
    if (!verificationCodeInput.trim()) {
      setErrorMessage('Please enter the 6-digit verification code sent to your Gmail.');
      return;
    }

    const { email: regEmail, password: regPass, name: regName } = verificationStep.payload;
    const result = await signUpWithEmail({
      email: regEmail,
      password: regPass,
      name: regName,
      code: verificationCodeInput.trim(),
    });

    if (!result.success) {
      setErrorMessage(result.error);
    } else {
      setVerificationStep(null);
    }
  };

  // Gmail Log In (EXACT MATCHING REQUIRED)
  const handleEmailLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !emailPassword.trim()) {
      setErrorMessage('Please enter both your Gmail address and your password.');
      return;
    }

    const result = await signInWithEmail({
      email: email.trim(),
      password: emailPassword.trim(),
    });

    if (!result.success) {
      // Show explicit error message if wrong Gmail or wrong password
      setErrorMessage(result.error);
    }
  };

  // ==========================================
  // PHONE NUMBER AUTHENTICATION WORKFLOWS
  // ==========================================

  // Step 1 of Phone Sign-Up: Validate fields & send SMS OTP
  const handleInitiatePhoneSignUp = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!displayName.trim()) {
      setErrorMessage('Please enter your display name.');
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.trim().length < 6) {
      setErrorMessage(`Please enter a valid phone number for ${selectedCountry.name}.`);
      return;
    }
    if (!phonePassword.trim() || phonePassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    const fullPhone = `${selectedCountry.dialCode}${phoneNumber.trim().replace(/\D/g, '')}`;
    const alreadyExists = registeredUsers.some(u => u.phone === fullPhone);
    if (alreadyExists) {
      setErrorMessage('This phone number is already registered. Please log in instead.');
      return;
    }

    // Generate and send SMS OTP
    const res = await sendPhoneOTP({
      phone: phoneNumber,
      dialCode: selectedCountry.dialCode,
    });

    if (res.success) {
      setVerificationStep({
        type: 'phone',
        target: fullPhone,
        generatedCode: res.code,
        payload: {
          name: displayName.trim(),
          phone: phoneNumber.trim(),
          dialCode: selectedCountry.dialCode,
          countryName: selectedCountry.name,
          password: phonePassword.trim(),
        },
      });
      setVerificationCodeInput('');
      setResendTimer(45);

      // Trigger simulated incoming SMS banner
      setSimulatedNotification({
        type: 'sms',
        title: `💬 SMS Message (${selectedCountry.flag} ${fullPhone})`,
        body: `VortexChat OTP: Your security code is ${res.code}. Do not share it.`,
        code: res.code,
      });
    }
  };

  // Step 2 of Phone Sign-Up: Verify OTP and complete registration
  const handleCompletePhoneSignUp = async () => {
    setErrorMessage('');
    if (!verificationCodeInput.trim()) {
      setErrorMessage('Please enter the 6-digit SMS OTP code sent to your phone.');
      return;
    }

    const { phone: pNum, dialCode: dCode, countryName: cName, password: pPass, name: pName } = verificationStep.payload;
    const result = await signUpWithPhone({
      phone: pNum,
      dialCode: dCode,
      countryName: cName,
      password: pPass,
      name: pName,
      otpCode: verificationCodeInput.trim(),
    });

    if (!result.success) {
      setErrorMessage(result.error);
    } else {
      setVerificationStep(null);
    }
  };

  // Phone Log In (via SMS OTP or Password)
  const handlePhoneLogin = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!phoneNumber.trim() || phoneNumber.trim().length < 6) {
      setErrorMessage(`Please enter a valid phone number for ${selectedCountry.name}.`);
      return;
    }

    const fullPhone = `${selectedCountry.dialCode}${phoneNumber.trim().replace(/\D/g, '')}`;

    if (phoneLoginMethod === 'otp') {
      // Send OTP to phone
      const res = await sendPhoneOTP({
        phone: phoneNumber,
        dialCode: selectedCountry.dialCode,
      });

      if (res.success) {
        setVerificationStep({
          type: 'phone_login',
          target: fullPhone,
          generatedCode: res.code,
          payload: {
            phone: phoneNumber.trim(),
            dialCode: selectedCountry.dialCode,
          },
        });
        setVerificationCodeInput('');
        setResendTimer(45);

        setSimulatedNotification({
          type: 'sms',
          title: `💬 SMS Login Code (${selectedCountry.flag} ${fullPhone})`,
          body: `VortexChat: Use code ${res.code} to sign in to your account.`,
          code: res.code,
        });
      }
    } else {
      // Login with phone password
      if (!phonePassword.trim()) {
        setErrorMessage('Please enter your account password.');
        return;
      }

      const result = await signInWithPhone({
        phone: phoneNumber,
        dialCode: selectedCountry.dialCode,
        password: phonePassword,
        loginMethod: 'password',
      });

      if (!result.success) {
        setErrorMessage(result.error);
      }
    }
  };

  // Complete Phone OTP Login
  const handleCompletePhoneLogin = async () => {
    setErrorMessage('');
    if (!verificationCodeInput.trim()) {
      setErrorMessage('Please enter the 6-digit SMS OTP code.');
      return;
    }

    const { phone: pNum, dialCode: dCode } = verificationStep.payload;
    const result = await signInWithPhone({
      phone: pNum,
      dialCode: dCode,
      otpCode: verificationCodeInput.trim(),
      loginMethod: 'otp',
    });

    if (!result.success) {
      setErrorMessage(result.error);
    } else {
      setVerificationStep(null);
    }
  };

  // Quick fill helper for demo accounts
  const handleFillDemo = (demoUser) => {
    if (demoUser.email) {
      setAuthMethod('email');
      setEmail(demoUser.email);
      setEmailPassword(demoUser.password);
    } else if (demoUser.phone) {
      setAuthMethod('phone');
      // Find matching country
      const matched = COUNTRIES.find(c => demoUser.phone.startsWith(c.dialCode)) || DEFAULT_COUNTRY;
      setSelectedCountry(matched);
      setPhoneNumber(demoUser.phone.replace(matched.dialCode, ''));
      setPhonePassword(demoUser.password);
      setPhoneLoginMethod('password');
    }
    setAuthMode('login');
    setShowDemoAccounts(false);
    setErrorMessage('');
  };

  // Filtered countries list for search (searches name, calling code with/without +, or ISO code)
  const trimmedSearch = countrySearch.trim().toLowerCase();
  const searchDigits = trimmedSearch.replace(/[^0-9]/g, '');

  const filteredCountries = COUNTRIES.filter(c => {
    if (!trimmedSearch) return true;
    const nameMatch = c.name.toLowerCase().includes(trimmedSearch);
    const codeMatch = c.code.toLowerCase().includes(trimmedSearch);
    const dialMatch = c.dialCode.toLowerCase().includes(trimmedSearch) ||
      (searchDigits && c.dialCode.replace(/[^0-9]/g, '').includes(searchDigits));
    return nameMatch || codeMatch || dialMatch;
  });

  return (
    <View style={styles.container}>
      {/* ================= SIMULATED PUSH NOTIFICATION POPUP ================= */}
      {simulatedNotification && (
        <TouchableOpacity
          style={styles.notificationToast}
          onPress={() => {
            if (simulatedNotification.code) {
              setVerificationCodeInput(simulatedNotification.code);
            }
          }}
          activeOpacity={0.9}
        >
          <View style={styles.notifIconCircle}>
            <Ionicons
              name={simulatedNotification.type === 'sms' ? 'chatbubble-ellipses' : 'mail'}
              size={18}
              color="#00F2FE"
            />
          </View>
          <View style={styles.notifTextWrap}>
            <Text style={styles.notifTitle}>{simulatedNotification.title}</Text>
            <Text style={styles.notifBody}>{simulatedNotification.body}</Text>
            <Text style={styles.notifTapAction}>⚡ Tap to auto-fill code: {simulatedNotification.code}</Text>
          </View>
          <TouchableOpacity onPress={() => setSimulatedNotification(null)}>
            <Ionicons name="close" size={16} color={THEME.textMuted} />
          </TouchableOpacity>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.brandBox}>
          <View style={styles.logoCircle}>
            <Ionicons name="flash" size={32} color={THEME.accentCyan} />
          </View>
          <Text style={styles.brandTitle}>VortexChat</Text>
          <Text style={styles.brandSubtitle}>
            Next-Gen Low-Bandwidth Voice, Video & High-Speed Sharing
          </Text>
        </View>

        {/* Main Card */}
        <View style={styles.card}>
          {/* ================= TWO-STEP VERIFICATION SCREEN ================= */}
          {verificationStep ? (
            <View style={styles.verificationContainer}>
              <View style={styles.verifyIconBox}>
                <Ionicons
                  name={verificationStep.type === 'email' ? 'mail-unread' : 'chatbubble-ellipses'}
                  size={36}
                  color={THEME.accentCyan}
                />
              </View>

              <Text style={styles.cardTitle}>Enter Verification Code</Text>
              <Text style={styles.cardSubtitle}>
                We sent a 6-digit security code to{' '}
                <Text style={styles.verifyTargetText}>{verificationStep.target}</Text>.
              </Text>

              {/* Error Box */}
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={THEME.dangerRose} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* 6-Digit Code Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>6-DIGIT VERIFICATION CODE</Text>
                <TextInput
                  style={styles.codeInput}
                  placeholder="• • • • • •"
                  placeholderTextColor={THEME.textMuted}
                  value={verificationCodeInput}
                  onChangeText={setVerificationCodeInput}
                  keyboardType="numeric"
                  maxLength={6}
                  autoFocus
                />
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={
                  verificationStep.type === 'email'
                    ? handleCompleteEmailSignUp
                    : verificationStep.type === 'phone'
                    ? handleCompletePhoneSignUp
                    : handleCompletePhoneLogin
                }
                disabled={authLoading}
                activeOpacity={0.8}
              >
                {authLoading ? (
                  <ActivityIndicator color="#080B11" size="small" />
                ) : (
                  <Text style={styles.primaryBtnText}>
                    {verificationStep.type === 'phone_login' ? 'Verify & Sign In' : 'Verify & Complete Sign Up'}
                  </Text>
                )}
              </TouchableOpacity>

              {/* Resend & Back Row */}
              <View style={styles.verifyActionsRow}>
                {resendTimer > 0 ? (
                  <Text style={styles.timerText}>Resend code in {resendTimer}s</Text>
                ) : (
                  <TouchableOpacity
                    onPress={
                      verificationStep.type === 'email'
                        ? handleInitiateEmailSignUp
                        : handleInitiatePhoneSignUp
                    }
                  >
                    <Text style={styles.resendLink}>Resend Code</Text>
                  </TouchableOpacity>
                )}

                <TouchableOpacity onPress={() => { setVerificationStep(null); setErrorMessage(''); }}>
                  <Text style={styles.cancelVerifyLink}>Change {verificationStep.type === 'email' ? 'Email' : 'Number'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              {/* Log In / Sign Up Mode Switcher Header */}
              <View style={styles.modeTabs}>
                <TouchableOpacity
                  style={[styles.modeTab, authMode === 'login' && styles.modeTabActive]}
                  onPress={() => { setAuthMode('login'); setErrorMessage(''); }}
                >
                  <Text style={[styles.modeTabText, authMode === 'login' && styles.modeTabTextActive]}>
                    Log In
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modeTab, authMode === 'signup' && styles.modeTabActive]}
                  onPress={() => { setAuthMode('signup'); setErrorMessage(''); }}
                >
                  <Text style={[styles.modeTabText, authMode === 'signup' && styles.modeTabTextActive]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.cardHeaderTitle}>
                {authMode === 'login' ? 'Welcome Back!' : 'Create Your Account'}
              </Text>
              <Text style={styles.cardHeaderSub}>
                {authMode === 'login'
                  ? 'Sign in using your exact registered Gmail or Phone number.'
                  : 'Register using your Gmail address or international Phone number.'}
              </Text>

              {/* Method Selector: Email (Gmail) vs Phone Number */}
              <View style={styles.methodSelector}>
                <TouchableOpacity
                  style={[styles.methodBtn, authMethod === 'email' && styles.methodBtnActive]}
                  onPress={() => { setAuthMethod('email'); setErrorMessage(''); }}
                >
                  <Ionicons
                    name="mail"
                    size={16}
                    color={authMethod === 'email' ? '#080B11' : THEME.textSecondary}
                  />
                  <Text style={[styles.methodText, authMethod === 'email' && styles.methodTextActive]}>
                    Gmail / Email
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.methodBtn, authMethod === 'phone' && styles.methodBtnActive]}
                  onPress={() => { setAuthMethod('phone'); setErrorMessage(''); }}
                >
                  <Ionicons
                    name="call"
                    size={16}
                    color={authMethod === 'phone' ? '#080B11' : THEME.textSecondary}
                  />
                  <Text style={[styles.methodText, authMethod === 'phone' && styles.methodTextActive]}>
                    Phone Number
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Error Notice Banner */}
              {errorMessage ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={16} color={THEME.dangerRose} />
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
              ) : null}

              {/* ======================================================= */}
              {/* EMAIL (GMAIL) AUTHENTICATION FORM                       */}
              {/* ======================================================= */}
              {authMethod === 'email' && (
                <View style={styles.formContainer}>
                  {authMode === 'signup' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>DISPLAY NAME</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. CyberPilot"
                        placeholderTextColor={THEME.textMuted}
                        value={displayName}
                        onChangeText={setDisplayName}
                      />
                    </View>
                  )}

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>GMAIL / EMAIL ADDRESS</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="yourname@gmail.com"
                      placeholderTextColor={THEME.textMuted}
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>PASSWORD</Text>
                    <View style={styles.passwordWrapper}>
                      <TextInput
                        style={styles.passwordInput}
                        placeholder="••••••••••••"
                        placeholderTextColor={THEME.textMuted}
                        value={emailPassword}
                        onChangeText={setEmailPassword}
                        secureTextEntry={!showEmailPassword}
                      />
                      <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowEmailPassword(p => !p)}
                      >
                        <Ionicons
                          name={showEmailPassword ? 'eye-off' : 'eye'}
                          size={18}
                          color={THEME.textSecondary}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {authMode === 'signup' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="••••••••••••"
                        placeholderTextColor={THEME.textMuted}
                        value={emailConfirmPassword}
                        onChangeText={setEmailConfirmPassword}
                        secureTextEntry={!showEmailPassword}
                      />
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={authMode === 'login' ? handleEmailLogin : handleInitiateEmailSignUp}
                    disabled={authLoading}
                    activeOpacity={0.8}
                  >
                    {authLoading ? (
                      <ActivityIndicator color="#080B11" size="small" />
                    ) : (
                      <Text style={styles.primaryBtnText}>
                        {authMode === 'login' ? 'Log In with Gmail' : 'Continue (Get Gmail Code)'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* ======================================================= */}
              {/* PHONE NUMBER AUTHENTICATION FORM                        */}
              {/* ======================================================= */}
              {authMethod === 'phone' && (
                <View style={styles.formContainer}>
                  {authMode === 'signup' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>DISPLAY NAME</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="e.g. Tanvir, Rahul, Dave"
                        placeholderTextColor={THEME.textMuted}
                        value={displayName}
                        onChangeText={setDisplayName}
                      />
                    </View>
                  )}

                  {/* Phone Country Code + Number Input Row (Telegram Style) */}
                  <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>PHONE NUMBER (ANY COUNTRY)</Text>
                    <View style={[styles.phoneInputRow, isPhoneFocused && styles.phoneInputRowFocused]}>
                      {/* Flag + Dial Code Trigger */}
                      <TouchableOpacity
                        style={styles.countryPickerTrigger}
                        onPress={() => {
                          setCountrySearch('');
                          setIsCountryModalOpen(true);
                        }}
                        activeOpacity={0.7}
                        accessibilityLabel={`Selected country: ${selectedCountry.name} (${selectedCountry.dialCode}). Tap to change country.`}
                      >
                        <CountryFlag country={selectedCountry} size="md" />
                        <Text style={styles.countryDialText}>{selectedCountry.dialCode}</Text>
                        <Ionicons name="chevron-down" size={13} color={THEME.textSecondary} />
                      </TouchableOpacity>

                      {/* Telegram Vertical Divider '|' */}
                      <View style={styles.phoneFieldDivider} />

                      {/* Phone Number Input */}
                      <TextInput
                        style={styles.phoneInput}
                        placeholder={selectedCountry.format || '1XXXXXXXXX'}
                        placeholderTextColor={THEME.textMuted}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        autoCapitalize="none"
                        autoCorrect={false}
                        onFocus={() => setIsPhoneFocused(true)}
                        onBlur={() => setIsPhoneFocused(false)}
                      />

                      {phoneNumber ? (
                        <TouchableOpacity
                          style={styles.phoneClearBtn}
                          onPress={() => setPhoneNumber('')}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Ionicons name="close-circle" size={16} color={THEME.textMuted} />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>

                  {/* Sign Up: Set Password */}
                  {authMode === 'signup' && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>SET ACCOUNT PASSWORD</Text>
                      <View style={styles.passwordWrapper}>
                        <TextInput
                          style={styles.passwordInput}
                          placeholder="••••••••••••"
                          placeholderTextColor={THEME.textMuted}
                          value={phonePassword}
                          onChangeText={setPhonePassword}
                          secureTextEntry={!showPhonePassword}
                        />
                        <TouchableOpacity
                          style={styles.eyeBtn}
                          onPress={() => setShowPhonePassword(p => !p)}
                        >
                          <Ionicons
                            name={showPhonePassword ? 'eye-off' : 'eye'}
                            size={18}
                            color={THEME.textSecondary}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Log In: Choice between SMS OTP and Password */}
                  {authMode === 'login' && (
                    <>
                      <View style={styles.phoneLoginTypeRow}>
                        <TouchableOpacity
                          style={[styles.phoneLoginTypeBtn, phoneLoginMethod === 'otp' && styles.phoneLoginTypeBtnActive]}
                          onPress={() => setPhoneLoginMethod('otp')}
                        >
                          <Ionicons name="chatbubble" size={12} color={phoneLoginMethod === 'otp' ? THEME.accentCyan : THEME.textMuted} />
                          <Text style={[styles.phoneLoginTypeText, phoneLoginMethod === 'otp' && styles.phoneLoginTypeTextActive]}>
                            SMS OTP Code
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[styles.phoneLoginTypeBtn, phoneLoginMethod === 'password' && styles.phoneLoginTypeBtnActive]}
                          onPress={() => setPhoneLoginMethod('password')}
                        >
                          <Ionicons name="key" size={12} color={phoneLoginMethod === 'password' ? THEME.accentCyan : THEME.textMuted} />
                          <Text style={[styles.phoneLoginTypeText, phoneLoginMethod === 'password' && styles.phoneLoginTypeTextActive]}>
                            Password
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {phoneLoginMethod === 'password' && (
                        <View style={styles.inputGroup}>
                          <Text style={styles.inputLabel}>PASSWORD</Text>
                          <View style={styles.passwordWrapper}>
                            <TextInput
                              style={styles.passwordInput}
                              placeholder="••••••••••••"
                              placeholderTextColor={THEME.textMuted}
                              value={phonePassword}
                              onChangeText={setPhonePassword}
                              secureTextEntry={!showPhonePassword}
                            />
                            <TouchableOpacity
                              style={styles.eyeBtn}
                              onPress={() => setShowPhonePassword(p => !p)}
                            >
                              <Ionicons
                                name={showPhonePassword ? 'eye-off' : 'eye'}
                                size={18}
                                color={THEME.textSecondary}
                              />
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}
                    </>
                  )}

                  <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={authMode === 'login' ? handlePhoneLogin : handleInitiatePhoneSignUp}
                    disabled={authLoading}
                    activeOpacity={0.8}
                  >
                    {authLoading ? (
                      <ActivityIndicator color="#080B11" size="small" />
                    ) : (
                      <Text style={styles.primaryBtnText}>
                        {authMode === 'login'
                          ? (phoneLoginMethod === 'otp' ? 'Send SMS OTP to Phone' : 'Log In with Phone Password')
                          : 'Continue (Send SMS OTP)'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}

              {/* ======================================================= */}
              {/* SOCIAL AUTHENTICATION BUTTONS AT BOTTOM                 */}
              {/* ======================================================= */}
              <View style={styles.socialDividerRow}>
                <View style={styles.socialDividerLine} />
                <Text style={styles.socialDividerText}>OR CONTINUE WITH</Text>
                <View style={styles.socialDividerLine} />
              </View>

              <View style={styles.socialButtonsList}>
                {/* 1. Continue with Google */}
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={signInWithGoogle}
                  activeOpacity={0.8}
                >
                  <View style={styles.socialIconBox}>
                    <Ionicons name="logo-google" size={18} color="#EA4335" />
                  </View>
                  <Text style={styles.socialBtnText}>Continue with Google</Text>
                </TouchableOpacity>

                {/* 2. Continue with Facebook */}
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={signInWithFacebook}
                  activeOpacity={0.8}
                >
                  <View style={styles.socialIconBox}>
                    <Ionicons name="logo-facebook" size={18} color="#1877F2" />
                  </View>
                  <Text style={styles.socialBtnText}>Continue with Facebook</Text>
                </TouchableOpacity>

                {/* 3. Continue with Microsoft */}
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={signInWithMicrosoft}
                  activeOpacity={0.8}
                >
                  <View style={styles.socialIconBox}>
                    <Ionicons name="logo-windows" size={18} color="#00A4EF" />
                  </View>
                  <Text style={styles.socialBtnText}>Continue with Microsoft</Text>
                </TouchableOpacity>

                {/* 4. Continue with Apple */}
                <TouchableOpacity
                  style={styles.socialBtn}
                  onPress={signInWithApple}
                  activeOpacity={0.8}
                >
                  <View style={styles.socialIconBox}>
                    <Ionicons name="logo-apple" size={18} color="#FFFFFF" />
                  </View>
                  <Text style={styles.socialBtnText}>Continue with Apple</Text>
                </TouchableOpacity>
              </View>

              {/* Demo Accounts Quick Test Accordion */}
              <TouchableOpacity
                style={styles.demoAccountsToggle}
                onPress={() => setShowDemoAccounts(!showDemoAccounts)}
                activeOpacity={0.7}
              >
                <Ionicons name="information-circle-outline" size={16} color={THEME.accentCyan} />
                <Text style={styles.demoAccountsToggleText}>
                  {showDemoAccounts ? 'Hide Demo Credentials' : 'Show Registered Demo Accounts (Quick Test)'}
                </Text>
                <Ionicons name={showDemoAccounts ? 'chevron-up' : 'chevron-down'} size={14} color={THEME.accentCyan} />
              </TouchableOpacity>

              {showDemoAccounts && (
                <View style={styles.demoAccountsBox}>
                  <Text style={styles.demoHelpText}>
                    Click any account below to autofill and test exact login matching:
                  </Text>
                  {registeredUsers.map(user => (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.demoUserRow}
                      onPress={() => handleFillDemo(user)}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={styles.demoUserName}>{user.name}</Text>
                        <Text style={styles.demoUserCreds}>
                          {user.email || user.phone} • Pass: {user.password}
                        </Text>
                      </View>
                      <View style={styles.demoFillBadge}>
                        <Text style={styles.demoFillText}>Auto-Fill</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}
        </View>

        {/* Security & Low Bandwidth Guarantee Footer */}
        <View style={styles.footerNoteBox}>
          <Ionicons name="shield-checkmark" size={14} color={THEME.successEmerald} />
          <Text style={styles.footerNoteText}>
            End-to-end encrypted session with ultra-low data transmission.
          </Text>
        </View>
      </ScrollView>

      {/* ================= INTERNATIONAL COUNTRY SELECTOR MODAL (TELEGRAM STYLE) ================= */}
      <Modal
        visible={isCountryModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsCountryModalOpen(false)}
      >
        <View style={styles.countryModalOverlay}>
          <View style={styles.countryModalCard}>
            {/* Header */}
            <View style={styles.countryModalHeader}>
              <View>
                <Text style={styles.countryModalTitle}>Choose a Country</Text>
                <Text style={styles.countryModalSub}>
                  {countrySearch.trim()
                    ? `${filteredCountries.length} countries found`
                    : `${COUNTRIES.length} countries available`}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.countryModalCloseBtn}
                onPress={() => {
                  setIsCountryModalOpen(false);
                  setCountrySearch('');
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={20} color={THEME.textPrimary} />
              </TouchableOpacity>
            </View>

            {/* Telegram Search Box */}
            <View style={styles.countrySearchBox}>
              <Ionicons name="search" size={16} color={THEME.accentCyan} />
              <TextInput
                style={styles.countrySearchInput}
                placeholder="Search country or code (e.g. Bangladesh, +880, India)"
                placeholderTextColor={THEME.textMuted}
                value={countrySearch}
                onChangeText={setCountrySearch}
                autoFocus={false}
              />
              {countrySearch ? (
                <TouchableOpacity onPress={() => setCountrySearch('')}>
                  <Ionicons name="close-circle" size={16} color={THEME.textMuted} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* FlatList for Silky Smooth Scrolling & Performance */}
            {filteredCountries.length > 0 ? (
              <FlatList
                data={filteredCountries}
                keyExtractor={(item) => item.code}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={20}
                maxToRenderPerBatch={25}
                windowSize={10}
                style={styles.countryList}
                renderItem={({ item }) => {
                  const isSelected = selectedCountry.code === item.code;
                  const isSearching = !!countrySearch.trim();

                  return (
                    <TouchableOpacity
                      style={[
                        styles.countryItem,
                        isSelected && styles.countryItemSelected,
                      ]}
                      onPress={() => {
                        setSelectedCountry(item);
                        setIsCountryModalOpen(false);
                        setCountrySearch('');
                      }}
                      activeOpacity={0.7}
                    >
                      {/* Crisp Visual Flag */}
                      <CountryFlag country={item} size="lg" />

                      {/* Country Name & Telegram Subtitle */}
                      <View style={styles.countryItemTextContainer}>
                        <Text style={[styles.countryItemName, isSelected && styles.countryItemNameSelected]}>
                          {item.name}
                        </Text>
                        <Text style={styles.countryItemSubtitle}>
                          {isSearching ? `${item.name} (${item.dialCode})` : `${item.name} ${item.dialCode}`}
                        </Text>
                      </View>

                      {/* Calling Code & Checkmark Indicator */}
                      <View style={styles.countryItemRight}>
                        <Text style={[styles.countryItemDial, isSelected && styles.countryItemDialSelected]}>
                          {item.dialCode}
                        </Text>
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={18} color={THEME.accentCyan} style={styles.countryItemCheck} />
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            ) : (
              <View style={styles.countryEmptyContainer}>
                <Ionicons name="search-outline" size={38} color={THEME.textMuted} />
                <Text style={styles.countryEmptyTitle}>No Country Found</Text>
                <Text style={styles.countryEmptySub}>
                  No matches for "{countrySearch}". Try searching by country name or dial code (e.g. "India", "+91").
                </Text>
                <TouchableOpacity
                  style={styles.countryResetBtn}
                  onPress={() => setCountrySearch('')}
                >
                  <Text style={styles.countryResetText}>Show All Countries</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.bgApp,
  },
  scrollContent: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 30 : 20,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#0E1E2C',
    borderWidth: 2,
    borderColor: 'rgba(0, 242, 254, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: THEME.textPrimary,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 11,
    color: THEME.textSecondary,
    marginTop: 3,
    textAlign: 'center',
  },
  notificationToast: {
    position: 'absolute',
    top: Platform.OS === 'android' ? 35 : 20,
    left: 12,
    right: 12,
    backgroundColor: '#0E243A',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#00F2FE',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 9999,
    shadowColor: '#00F2FE',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  notifIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifTextWrap: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#00F2FE',
  },
  notifBody: {
    fontSize: 11,
    color: THEME.textPrimary,
    marginTop: 2,
  },
  notifTapAction: {
    fontSize: 10,
    color: THEME.successEmerald,
    fontWeight: '700',
    marginTop: 3,
  },
  card: {
    backgroundColor: THEME.bgSurface,
    borderRadius: THEME.radiusXl,
    padding: 20,
    borderWidth: 1.5,
    borderColor: THEME.borderLight,
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: THEME.bgCard,
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeTabActive: {
    backgroundColor: THEME.accentCyan,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.textSecondary,
  },
  modeTabTextActive: {
    color: '#080B11',
  },
  cardHeaderTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: THEME.textPrimary,
    textAlign: 'center',
  },
  cardHeaderSub: {
    fontSize: 11,
    color: THEME.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 16,
  },
  methodSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: THEME.bgCard,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  methodBtnActive: {
    backgroundColor: '#00F2FE',
    borderColor: '#00F2FE',
  },
  methodText: {
    fontSize: 12,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  methodTextActive: {
    color: '#080B11',
  },
  formContainer: {
    gap: 12,
  },
  inputGroup: {
    gap: 5,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.6,
  },
  input: {
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: THEME.textPrimary,
    fontSize: 13,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    color: THEME.textPrimary,
    fontSize: 13,
    paddingVertical: 10,
  },
  eyeBtn: {
    padding: 6,
  },
  // Country Flag Styles (FlagCDN image with rounded border and fallback)
  flagWrapper: {
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: '#101622',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flagImageFill: {
    width: '100%',
    height: '100%',
  },
  flagFallbackWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  flagFallbackText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
  // Telegram-style Phone Number Row
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    borderWidth: 1.5,
    borderColor: THEME.borderLight,
    borderRadius: 9,
    overflow: 'hidden',
  },
  phoneInputRowFocused: {
    borderColor: THEME.accentCyan,
    backgroundColor: 'rgba(0, 242, 254, 0.03)',
  },
  countryPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 10,
    paddingHorizontal: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  countryDialText: {
    fontSize: 13,
    fontWeight: '800',
    color: THEME.textPrimary,
  },
  phoneFieldDivider: {
    width: 1.5,
    height: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginHorizontal: 1,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: 'transparent',
    borderWidth: 0,
    paddingHorizontal: 11,
    paddingVertical: 10,
    color: THEME.textPrimary,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  phoneClearBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  phoneLoginTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  phoneLoginTypeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  phoneLoginTypeBtnActive: {
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    borderColor: 'rgba(0, 242, 254, 0.4)',
  },
  phoneLoginTypeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textMuted,
  },
  phoneLoginTypeTextActive: {
    color: THEME.accentCyan,
  },
  primaryBtn: {
    backgroundColor: THEME.accentCyan,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  primaryBtnText: {
    color: '#080B11',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 71, 87, 0.15)',
    borderWidth: 1,
    borderColor: THEME.dangerRose,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#FFA8A8',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    lineHeight: 16,
  },
  socialDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 22,
    marginBottom: 14,
  },
  socialDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.borderLight,
  },
  socialDividerText: {
    fontSize: 9,
    fontWeight: '800',
    color: THEME.textMuted,
    letterSpacing: 0.6,
  },
  socialButtonsList: {
    gap: 8,
  },
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    borderWidth: 1,
    borderColor: THEME.borderLight,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 12,
  },
  socialIconBox: {
    width: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialBtnText: {
    color: THEME.textPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  demoAccountsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 18,
    paddingVertical: 6,
  },
  demoAccountsToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.accentCyan,
  },
  demoAccountsBox: {
    backgroundColor: '#090D15',
    borderRadius: 8,
    padding: 10,
    marginTop: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.2)',
    gap: 6,
  },
  demoHelpText: {
    fontSize: 10,
    color: THEME.textMuted,
    marginBottom: 4,
  },
  demoUserRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: THEME.bgCard,
    padding: 8,
    borderRadius: 6,
  },
  demoUserName: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  demoUserCreds: {
    fontSize: 10,
    color: THEME.accentCyan,
    marginTop: 1,
  },
  demoFillBadge: {
    backgroundColor: 'rgba(0, 242, 254, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  demoFillText: {
    fontSize: 10,
    fontWeight: '800',
    color: THEME.accentCyan,
  },
  verificationContainer: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  verifyIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(0, 242, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  verifyTargetText: {
    fontWeight: '800',
    color: THEME.accentCyan,
  },
  codeInput: {
    backgroundColor: THEME.bgCard,
    borderWidth: 1.5,
    borderColor: THEME.accentCyan,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 8,
    textAlign: 'center',
    color: '#00F2FE',
    width: 220,
  },
  verifyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    paddingHorizontal: 4,
  },
  timerText: {
    fontSize: 11,
    color: THEME.textMuted,
  },
  resendLink: {
    fontSize: 11,
    fontWeight: '800',
    color: THEME.accentCyan,
  },
  cancelVerifyLink: {
    fontSize: 11,
    color: THEME.dangerRose,
    fontWeight: '700',
  },
  footerNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 20,
  },
  footerNoteText: {
    fontSize: 10,
    color: THEME.textMuted,
  },
  countryModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(4, 7, 12, 0.88)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  countryModalCard: {
    backgroundColor: THEME.bgSurface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1.5,
    borderColor: THEME.borderHighlight,
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    padding: 16,
    paddingBottom: Platform.OS === 'android' ? 24 : 30,
  },
  countryModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  countryModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: THEME.textPrimary,
    letterSpacing: 0.3,
  },
  countryModalSub: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  countryModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countrySearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.bgCard,
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.borderLight,
  },
  countrySearchInput: {
    flex: 1,
    color: THEME.textPrimary,
    fontSize: 13,
    padding: 0,
  },
  countryList: {
    maxHeight: 400,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 8,
    gap: 12,
  },
  countryItemSelected: {
    backgroundColor: 'rgba(0, 242, 254, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(0, 242, 254, 0.25)',
  },
  countryItemTextContainer: {
    flex: 1,
  },
  countryItemName: {
    fontSize: 14,
    color: THEME.textPrimary,
    fontWeight: '700',
  },
  countryItemNameSelected: {
    color: THEME.accentCyan,
  },
  countryItemSubtitle: {
    fontSize: 11,
    color: THEME.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  countryItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countryItemDial: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  countryItemDialSelected: {
    color: THEME.accentCyan,
    fontWeight: '800',
  },
  countryItemCheck: {
    marginLeft: 2,
  },
  countryEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    paddingHorizontal: 20,
    gap: 8,
  },
  countryEmptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.textPrimary,
  },
  countryEmptySub: {
    fontSize: 12,
    color: THEME.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
  countryResetBtn: {
    marginTop: 10,
    backgroundColor: 'rgba(0, 242, 254, 0.12)',
    borderWidth: 1,
    borderColor: THEME.accentCyan,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  countryResetText: {
    color: THEME.accentCyan,
    fontSize: 12,
    fontWeight: '700',
  },
});
