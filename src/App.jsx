import { useState } from 'react'
import { supabase } from './lib/supabase'
import './App.css'

import AdminDashboard from './pages/AdminDashboard'
import UserDashboard from './pages/UserDashboard'
import { loadSportNames } from './lib/sports'

function App() {

  // ==========================================
  // PAGE
  // ==========================================

  // The app opens straight on the login screen.
  const [page, setPage] = useState('login')

  // ==========================================
  // LOGIN
  // ==========================================

  const [showPassword, setShowPassword] =
    useState(false)

  const [rememberMe, setRememberMe] =
    useState(false)

  const [loginId, setLoginId] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [userProfile, setUserProfile] =
    useState(null)

  // ==========================================
  // LOGIN
  // ==========================================

  const handleLogin = async (e) => {

    e.preventDefault()

    if (
      !loginId.trim() ||
      !password
    ) {
      alert(
        'Sila masukkan ID Pengguna dan Kata Laluan.'
      )

      return
    }

    try {

      const normalizedLoginId =
        loginId
          .trim()
          .toUpperCase()

      console.log(
        'LOGIN ID:',
        normalizedLoginId
      )

      // ========================================
      // INTERNAL EMAIL
      // ========================================

      // Email pattern for sport accounts ({id} = lowercase login ID).
      // Use an inbox MSP owns (e.g. mspahang+{id}@gmail.com) so Supabase
      // emails (reset / magic link) can't reach a stranger.
      const loginEmailTemplate =
        import.meta.env.VITE_LOGIN_EMAIL_TEMPLATE ||
        '{id}@gmail.com'

      const internalEmail =
        normalizedLoginId === 'ADMIN'
          ? 'mspahang@gmail.com'
          : loginEmailTemplate.replace(
              '{id}',
              normalizedLoginId.toLowerCase()
            )

      console.log(
        'INTERNAL EMAIL:',
        internalEmail
      )

      // ========================================
      // SUPABASE AUTH
      // ========================================

      const {
        data,
        error,
      } =
        await supabase.auth.signInWithPassword({
          email: internalEmail,
          password,
        })

      if (error) {

        console.error(
          'LOGIN AUTH ERROR:',
          error
        )

        alert(
          `ID Pengguna atau Kata Laluan tidak sah.\n\n${error.message}`
        )

        return
      }

      // ========================================
      // USER ID
      // ========================================

      const userId =
        data.user.id

      console.log(
        'AUTH USER ID:',
        userId
      )

      // ========================================
      // PROFILE
      // ========================================

      const {
        data: profile,
        error: profileError,
      } =
        await supabase
          .from('profiles')
          .select(
            'name, login_id, sport, role, email'
          )
          .eq('id', userId)
          .single()

      if (
        profileError ||
        !profile
      ) {

        console.error(
          'PROFILE ERROR:',
          profileError
        )

        await supabase.auth.signOut()

        alert(
          'Profil pengguna tidak dapat ditemui.'
        )

        return
      }

      console.log(
        'PROFILE:',
        profile
      )

      console.log(
        'ROLE:',
        profile.role
      )

      console.log(
        'SPORT:',
        profile.sport
      )

      // Sport names for display (reports store the sport code).
      await loadSportNames()

      setUserProfile(profile)

      // ========================================
      // REDIRECT
      // ========================================

      if (
        profile.role === 'admin'
      ) {

        setPage('admin')

      } else {

        setPage('dashboard')
      }

    } catch (error) {

      console.error(
        'UNEXPECTED LOGIN ERROR:',
        error
      )

      alert(
        `Berlaku masalah semasa log masuk.\n\n${
          error.message || ''
        }`
      )
    }
  }

  // ==========================================
  // ADMIN
  // ==========================================

  if (page === 'admin') {

    const handleAdminLogout = () => {

      setUserProfile(null)

      setLoginId('')

      setPassword('')

      setPage('login')
    }

    return (
      <AdminDashboard
        userProfile={userProfile}
        onLogout={handleAdminLogout}
      />
    )
  }

  // ==========================================
  // LOGIN
  // ==========================================

  if (page === 'login') {

    return (

      <main className="login-page">

        <div className="login-container">

          {/* LOGO */}

        <div className="login-logo">
          <img
            src="/images/logomsp.png"
            alt="Majlis Sukan Pahang"
            className="msp-logo"
          />
        </div>

          {/* TITLE */}

          <div className="login-header">

            <h1>
              
            </h1>

            <p>
              Majlis Sukan Pahang
            </p>

          </div>

          {/* LOGIN CARD */}

          <div className="login-card">

            <div className="login-card-header">

              <div>

                <h2>
                  POST-MORTEM
                </h2>

                <p>
                  SUKMA XXII & PARA SUKMA
                  SELANGOR 2026
                </p>

              </div>

            </div>

            <form
              onSubmit={handleLogin}
            >

              {/* ID */}

              <div className="form-group">

                <label htmlFor="loginId">
                  ID Pengguna
                </label>

                <input
                  id="loginId"
                  type="text"
                  placeholder="Contoh: OLAHRAGA"
                  value={loginId}
                  onChange={(e) =>
                    setLoginId(
                      e.target.value
                    )
                  }
                  autoComplete="username"
                />

              </div>

              {/* PASSWORD */}

              <div className="form-group">

                <label htmlFor="password">
                  Kata Laluan
                </label>

                <div className="password-wrapper">

                  <input
                    id="password"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    placeholder="Masukkan kata laluan"
                    value={password}
                    onChange={(e) =>
                      setPassword(
                        e.target.value
                      )
                    }
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan kata laluan' : 'Lihat kata laluan'}
                  >
                    {showPassword ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M3 3L21 21"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M10.58 10.58A2 2 0 0013.42 13.42"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                        <path
                          d="M9.88 5.09C10.55 4.92 11.25 4.83 12 4.83C16.5 4.83 20.25 7.55 21.5 12C21.12 13.35 20.48 14.55 19.65 15.56"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.35 6.35C4.93 7.55 3.82 9.12 3.25 12C4.5 16.45 8.25 19.17 12.75 19.17C13.5 19.17 14.2 19.08 14.87 18.91"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          d="M2.5 12C3.8 7.55 7.5 4.83 12 4.83C16.5 4.83 20.2 7.55 21.5 12C20.2 16.45 16.5 19.17 12 19.17C7.5 19.17 3.8 16.45 2.5 12Z"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinejoin="round"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r="3"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        />
                      </svg>
                    )}
                  </button>

                </div>

              </div>

              {/* REMEMBER ME */}

              <div className="login-options">

                <label className="remember-me">

                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) =>
                      setRememberMe(
                        e.target.checked
                      )
                    }
                  />

                  <span>
                    Ingat saya
                  </span>

                </label>

                <button
                  type="button"
                  className="forgot-password"
                  onClick={() =>
                    alert(
                      'Sila hubungi Administrator EWCC untuk mendapatkan bantuan.'
                    )
                  }
                >
                  Lupa kata laluan?
                </button>

              </div>

              {/* LOGIN BUTTON */}

              <button
                type="submit"
                className="main-login-button"
              >
                LOG MASUK
              </button>

            </form>

            {/* BACK */}

            <button
              type="button"
              className="back-home-button"
              onClick={() =>
                setPage('home')
              }
            >
              ← Kembali ke Laman Utama
            </button>

          </div>

          {/* FOOTER */}

          <div className="login-footer">

            <span>
              EWCC Post-Mortem • Versi 1.0
            </span>

            <span>
              Majlis Sukan Pahang
            </span>

          </div>

        </div>

      </main>
    )
  }

  // ==========================================
  // USER DASHBOARD
  // ==========================================

if (page === 'dashboard') {

  const handleUserLogout = () => {

    setUserProfile(null)

    setLoginId('')

    setPassword('')

    setPage('login')

  }

  return (

    <UserDashboard
      userProfile={userProfile}
      onLogout={handleUserLogout}
    />

  )
}

  // ==========================================
  // HOME
  // ==========================================

  return (

    <main className="ewcc-home">

      <div className="background-glow glow-one"></div>
      <div className="background-glow glow-two"></div>

      <div className="home-container">

        {/* LOGO */}

        <div className="brand-logo">

          <div className="logo-shield">
            <span>EW</span>
          </div>

        </div>

        {/* TITLE */}

        <div className="brand-section">

          <h1>
            Elephant Warrior Command Centre
          </h1>

          <p className="organization">
            Majlis Sukan Pahang
          </p>

          <p className="choose-title">
            PILIH KEJOHANAN
          </p>

        </div>

        {/* COMPETITION */}

        <div className="competition-grid">

          <button
            className="competition-card"
            onClick={() =>
              alert(
                'Paparan SUKMA akan dibina kemudian.'
              )
            }
          >

            <div className="card-top">

              <div className="competition-icon orange-icon">
                🏆
              </div>

              <span className="arrow">
                ›
              </span>

            </div>

            <div className="card-content">

              <h2>
                SUKMA
              </h2>

              <p className="card-subtitle">
                Sukan Malaysia
              </p>

              <p className="card-description">
                Data pertandingan, keputusan
                dan pingat bagi kontinjen
                Pahang.
              </p>

            </div>

            <div className="card-button orange-button">
              Masuk
              <span>›</span>
            </div>

          </button>

          <button
            className="competition-card"
            onClick={() =>
              alert(
                'Paparan Para SUKMA akan dibina kemudian.'
              )
            }
          >

            <div className="card-top">

              <div className="competition-icon blue-icon">
                ♿
              </div>

              <span className="arrow">
                ›
              </span>

            </div>

            <div className="card-content">

              <h2>
                PARA SUKMA
              </h2>

              <p className="card-subtitle">
                Para Sukan Malaysia
              </p>

              <p className="card-description">
                Data pertandingan, keputusan
                dan pingat bagi kontinjen
                Pahang.
              </p>

            </div>

            <div className="card-button blue-button">
              Masuk
              <span>›</span>
            </div>

          </button>

        </div>

        {/* LOGIN */}

        <div className="login-section">

          <button
            className="login-button"
            onClick={() =>
              setPage('login')
            }
          >

            <span className="login-icon">
              🔐
            </span>

            <span>
              LOG MASUK
            </span>

          </button>

        </div>

        {/* FOOTER */}

        <div className="footer">

          <p>
            EWCC Version 1.0
          </p>

          <p>
            Majlis Sukan Pahang
          </p>

        </div>

      </div>

    </main>
  )
}

export default App