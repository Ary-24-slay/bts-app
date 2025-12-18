import { useEffect, useState, useRef } from 'react';
import './App.css';

import tigerImg from './assets/tiger.jpg';
import whistle from './assets/whistle.m4a';
import fart from './assets/fart.m4a';
import choti from './assets/choti.m4a';
import cakeUnlit from './assets/cake_unlit.gif';
import cakeBg from './assets/cake_bg.png';   
import cakeLit from './assets/cake_lit.gif';
import matchImg from './assets/match.gif';
import themeMusic from './assets/armyversary-theme.mp3';
import comingSoonGif from './assets/coming-soon.gif';
import openingGif from './assets/bts-opening.gif';
import { useMicLevel } from './hooks/useMicLevel';
import {
  HandLandmarker,
  FilesetResolver
} from '@mediapipe/tasks-vision';
import { getSpotifyAuthUrl } from './spotifyConfig';
import { auth } from './firebase';  
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { supabase } from './supabaseClient';
import confetti from 'canvas-confetti';
const CLOUDINARY_CLOUD_NAME = 'drmdrh2uq';
const CLOUDINARY_UPLOAD_PRESET = 'bts_arsd_unsigned';


const eraThemes = {
  school: {
    label: 'School',
    bg: '#b8d7b2ff' // soft green
  },
  hyyh: {
    label: 'HYYH',
    bg: '#96C8D5' // blush pink
  },
  wings: {
    label: 'WINGS',
    bg: '#000000' // light gray
  },
  lys: {
    label: 'LYS',
    bg: '#F3ABC2' // pastel pink
  },
  mots: {
    label: 'MOTS',
    bg: '#d6dbf2ff' // warm pink
  },
  be: {
    label: 'BE',
    bg: '#001C3D' // soft off‑white
  },
  butter: {
    label: 'Butter / PTD',
    bg: '#e5dca0ff' // soft yellow
  },
  proof: {
    label: 'Proof',
    bg: '#2B2B2B' // muted gray
  }
};

const quizQuestions = [
  {
    q: 'How are you feeling right now?',
    options: ['Happy 😊', 'Sad 😢', 'Anxious 😰', 'Energetic ⚡', 'Calm 😌']
  },
  {
    q: 'What do you need most?',
    options: ['Comfort 🤗', 'Motivation 💪', 'Joy 🎉', 'Peace ☮️', 'Energy ⚡']
  },
  {
    q: 'Your energy level?',
    options: ['High 🔥', 'Medium 👌', 'Low 😴', 'Exhausted 💤', 'Restless 🌀']
  }
];

const moodPlaylists = {
  happy: {
    title: 'Happy BTS Playlist',
    uri: '4fmxdvS2uQG8rjcrNyZsSt',
    reason: 'Bright and bubbly songs for your happy energy.'
  },
  sad: {
    title: 'Sad & Comfort BTS Playlist',
    uri: '7p8hvDQE0dwOh4NO2E5h6x',
    reason: 'Comfort tracks for when you miss someone or feel low.'
  },
  energetic: {
    title: 'Energetic BTS Playlist',
    uri: '2DUO7mJm8AUVkKqpyo9itz',
    reason: 'High-energy songs to match your ⚡ mood.'
  },
  anxious: {
    title: 'Anxious → Soft Comfort Playlist',
    uri: '4r7mBgLPHa1AZZ9NWolUtT',
    reason: 'Calming BTS songs for when your mind is racing.'
  },
  calm: {
    title: 'Calm & Soft BTS Playlist',
    uri: '20WSQLliEHcipckO9tj2bI',
    reason: 'Gentle tracks for peaceful, slow moments.'
  }
};

const timeline = [
  { date: '2013-06-13', title: 'BTS Debut', description: "BTS debuted with '2 Cool 4 Skool'" },
  { date: '2013-09-11', title: 'O!RUL8,2?', description: 'Second single album released' },
  { date: '2014-02-12', title: 'Skool Luv Affair', description: 'First Billboard chart entry' },
  { date: '2014-08-19', title: 'Dark & Wild', description: 'First studio album' },
  { date: '2015-04-29', title: 'HYYH Pt.1', description: 'Breakthrough era begins' },
  { date: '2015-11-30', title: 'HYYH Pt.2', description: 'Coming-of-age trilogy continues' },
  { date: '2016-05-02', title: 'Young Forever', description: 'HYYH series finale' },
  { date: '2016-10-10', title: 'Wings', description: 'Wings era with huge growth' },
  { date: '2017-02-13', title: 'You Never Walk Alone', description: 'Includes Spring Day' },
  { date: '2017-09-18', title: 'Love Yourself: Her', description: 'Love Yourself series begins' },
  { date: '2018-05-18', title: 'Love Yourself: Tear', description: 'First #1 on Billboard 200' },
  { date: '2018-08-24', title: 'Love Yourself: Answer', description: 'Series conclusion' },
  { date: '2019-04-12', title: 'Map of the Soul: Persona', description: 'Boy With Luv era' },
  { date: '2020-02-21', title: 'Map of the Soul: 7', description: 'Record‑breaking album' },
  { date: '2020-08-21', title: 'Dynamite', description: 'First #1 on Billboard Hot 100' },
  { date: '2020-11-20', title: 'BE', description: 'Pandemic‑era comfort album' },
  { date: '2021-05-21', title: 'Butter', description: 'Massive global hit' },
  { date: '2021-07-09', title: 'Permission to Dance', description: 'Third full English single' },
  { date: '2022-06-10', title: 'Proof', description: 'Anthology celebrating their history' }
];



function App() {
  const [showOpening, setShowOpening] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [activeSection, setActiveSection] = useState('memberSelection');
  const [currentTheme, setCurrentTheme] = useState(() => {
  const saved = localStorage.getItem('btsTheme');
  return saved || 'love'; // default theme key
});
  const [spotifyToken, setSpotifyToken] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [spotifyLinkedForUser, setSpotifyLinkedForUser] = useState(false);
  const [spotifyProfile, setSpotifyProfile] = useState(null); // new
  const [armyDateFromDb, setArmyDateFromDb] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showNicknameModal, setShowNicknameModal] = useState(false);




  // watch Firebase auth state
  const [authLoaded, setAuthLoaded] = useState(false);
  console.log('activeSection =', activeSection);

useEffect(() => {
  localStorage.setItem('btsTheme', currentTheme);
}, [currentTheme]);

useEffect(() => {
  const unsub = onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged user =', user);
    setCurrentUser(user || null);
    setAuthLoaded(true);
  });
  return () => unsub();
}, []);
// 1) Load ARMY date from Supabase
useEffect(() => {
  async function loadArmyDateForApp() {
    if (!authLoaded || !currentUser) return;

    const { data, error } = await supabase
      .from('army_profiles')
      .select('army_date')
      .eq('uid', currentUser.uid)
      .maybeSingle();

    if (error) {
      console.error('loadArmyDateForApp error', error);
      return;
    }

    if (data && data.army_date) {
      setArmyDateFromDb(data.army_date);  // 'YYYY-MM-DD'
    } else {
      setArmyDateFromDb('2013-07-09');    // optional default
    }
  }

  loadArmyDateForApp();
}, [authLoaded, currentUser]);

// 2) Replace your old redirect effect with THIS debug version
useEffect(() => {
  console.log(
    'armyDateFromDb in App =',
    armyDateFromDb,
    'authLoaded=',
    authLoaded,
    'user=',
    currentUser?.uid
  );

  if (!authLoaded || !currentUser) {
    console.log('skip: not loaded or no user');
    return;
  }
  if (!armyDateFromDb) {
    console.log('skip: no armyDateFromDb');
    return;
  }

  const today = new Date();
  const start = new Date(armyDateFromDb);
  console.log('start date parsed =', start);

  const sameMonthDay =
    today.getMonth() === start.getMonth() &&
    today.getDate() === start.getDate();

  let years = today.getFullYear() - start.getFullYear();
  const beforeAnnivThisYear =
    today.getMonth() < start.getMonth() ||
    (today.getMonth() === start.getMonth() &&
      today.getDate() < start.getDate());
  if (beforeAnnivThisYear) years -= 1;

  console.log('sameMonthDay=', sameMonthDay, 'years=', years);

  if (!sameMonthDay || years <= 0) {
    console.log('skip: not anniversary or <1 year');
    return;
  }

  const key = `armyversary_seen_${currentUser.uid}_${today.getFullYear()}`;
  console.log('localStorage key =', key, 'value =', localStorage.getItem(key));

  // TEMP: ignore localStorage until redirect works
  // if (localStorage.getItem(key) === 'true') return;

  localStorage.setItem(key, 'true');
  console.log('SETTING activeSection to armyversaryRoom');
  setActiveSection('armyversaryRoom');
}, [authLoaded, currentUser, armyDateFromDb]);



  function handleLogout() {
    signOut(auth)
      .then(() => {
        console.log('Logged out');
        alert('Logged out');
      })
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  }

  function connectSpotify(e) {
    if (e && e.preventDefault) e.preventDefault();
    const url = getSpotifyAuthUrl();
    window.location.assign(url);
  }

  // opening card → login
  useEffect(() => {
    const t1 = setTimeout(() => {
      setShowOpening(false);
      setShowLogin(true);
    }, 4500);
    return () => clearTimeout(t1);
  }, []);

  // theme changes
  useEffect(() => {
  const era = eraThemes[currentTheme];
  if (era) {
    document.body.style.background = era.bg;
    document.body.style.color = '#111';
  }
}, [currentTheme]);

useEffect(() => {
  async function handleSpotifyCallback() {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    console.log('Spotify code:', code);
    console.log('Spotify error:', error);

    if (error) return;

    // If we have a code but auth hasn’t finished restoring yet, wait
    if (code && !currentUser) {
      return; // effect will run again when currentUser is set
    }

    // No code in URL → normal load: restore from Supabase/local
    if (!code) {
      if (!currentUser) return;

      const linked =
        localStorage.getItem(`spotifyLinked_${currentUser.uid}`) === 'true';
      setSpotifyLinkedForUser(linked);

      const { data, error: dbError } = await supabase
        .from('spotify_links')
        .select('spotify_id, display_name')
        .eq('uid', currentUser.uid)
        .maybeSingle();

      if (!dbError && data) {
        setSpotifyLinkedForUser(true);
        setSpotifyProfile(data);
      }

      return;
    }

    // From here: code exists AND currentUser is non-null
    try {
      const backendUrl =
        process.env.REACT_APP_SPOTIFY_BACKEND_URL ||
        'https://bts-spotify-backend.onrender.com';

      const res = await fetch(`${backendUrl}/spotify/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });

      if (!res.ok) {
        console.error('Backend Spotify callback failed');
        return;
      }

      const { spotify_id, display_name } = await res.json();
      console.log('Spotify profile from backend:', spotify_id, display_name);

      const { data, error: dbError } = await supabase
        .from('spotify_links')
        .upsert(
          {
            uid: currentUser.uid,
            spotify_id,
            display_name
          },
          { onConflict: 'uid' }
        )
        .select('spotify_id, display_name')
        .single();

      if (dbError) {
        console.error('Supabase spotify_links upsert error:', dbError);
        return;
      }

      localStorage.setItem(`spotifyLinked_${currentUser.uid}`, 'true');
      setSpotifyLinkedForUser(true);
      setSpotifyProfile(data);

      alert(`✅ Spotify connected as ${data.display_name || spotify_id}`);
    } catch (e) {
      console.error(e);
    }
  }

  handleSpotifyCallback();
}, [currentUser, supabase]);

  return (
    <>
      {showOpening && (
        <div className="opening-card">
          <div className="opening-title">WELCOME FIRST TIME TO BTS ??</div>
          <div className="opening-image">
        <img
          src={openingGif}
          alt="BTS opening animation"
          style={{
            width: '1800px',
            height: '600px',
            maxWidth: '80vw',
            borderRadius: '16px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.25)'
          }}
        />
      </div>
          <div className="opening-signature">MADE BY AARYA</div>
        </div>
      )}

      {showLogin && !currentUser && (
  <LoginModal onClose={() => setShowLogin(false)} />
)}

{showNicknameModal && currentUser && (
  <NicknameModal
    user={currentUser}
    onClose={() => setShowNicknameModal(false)}
  />
)}




      <div className="app active">
        {/* top-right mini nav bar */}
        <div
          style={{
            position: 'fixed',
            top: '16px',
            right: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            zIndex: 1000
          }}
        >
          <ThemeSwitcher
            currentTheme={currentTheme}
            onChangeTheme={setCurrentTheme}
          />

          
<AccountMenu
  user={currentUser}
  onLogout={handleLogout}
  onConnectSpotify={connectSpotify}
  showOpening={showOpening}
  spotifyLinked={spotifyLinkedForUser}
  spotifyProfile={spotifyProfile}
  onShowLogin={() => setShowLogin(true)}          // ← HERE
  onEditNickname={() => setShowNicknameModal(true)}
/>



        </div>

        {activeSection === 'memberSelection' && (
          <MemberSelection setActiveSection={setActiveSection} />
        )}

        {activeSection === 'trivia' && authLoaded && (
  <TigerGame
    onBack={() => setActiveSection('memberSelection')}
    tigerImg={tigerImg}
    whistle={whistle}
    fart={fart}
    choti={choti}
    currentUser={currentUser}
  />
)}


        {activeSection === 'quotes' && (
          <QuotesSection onBack={() => setActiveSection('memberSelection')} />
        )}

        {activeSection === 'music' && (
          <RecipesSection onBack={() => setActiveSection('memberSelection')} />
        )}

        {activeSection === 'gallery' && (
          <GallerySection
           onBack={() => setActiveSection('memberSelection')}
           currentUser={currentUser}
          />
       )}


        {activeSection === 'quiz' && (
          <QuizSection onBack={() => setActiveSection('memberSelection')} />
        )}

        {activeSection === 'arsd' && (
          <ArsdSection onBack={() => setActiveSection('memberSelection')} />
        )}

        {activeSection === 'timeline' && (
          <TimelineSection
           onBack={() => setActiveSection('memberSelection')}
           onCelebrate={() => {
           confetti({
           particleCount: 200,
           spread: 70,
           origin: { y: 0.6 }
          });
       }}
      />
          )}
 

        {activeSection === 'army' && (
          <ArmyDaySection
            onBack={() => setActiveSection('memberSelection')}
            currentUser={currentUser}  // add this
          />
        )}

        {activeSection === 'armyDay' && (
          <ArmyDaySection
           onBack={() => setActiveSection('memberSelection')}
           currentUser={currentUser}
           setArmyDateFromDb={setArmyDateFromDb}
         />
        )}

        {activeSection === 'armyversaryRoom' && (
           <ArmyversaryRoom
            onBack={() => setActiveSection('memberSelection')}
            currentUser={currentUser}
            armyDate={armyDateFromDb}
          />
        )}

        <Footer />
      </div>
    </>
  );
}


function LoginModal({ onClose }) {
  const [tab, setTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  function handleEmailLogin() {
    if (!loginEmail || !loginPassword) {
      alert('Please enter email and password');
      return;
    }
    signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      .then((userCredential) => {
        console.log('Logged in:', userCredential.user);
        onClose();
      })
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  }

  async function handleEmailSignup() {
    if (!signupName || !signupEmail || !signupPassword) {
      alert('Please fill all fields');
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        signupEmail,
        signupPassword
      );
      const user = userCredential.user;
      console.log('Signed up:', user, 'name:', signupName);

      // set Firebase displayName = nickname
      await updateProfile(user, {
        displayName: signupName
      });

      onClose();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function handleGoogleLogin() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log('Google login:', user);

    // Always ask (pre-fill with existing name if any)
    const nickname = window.prompt(
      'Choose a nickname to use in the app:',
      user.displayName || ''
    );
    if (nickname && nickname.trim()) {
      try {
        await updateProfile(user, { displayName: nickname.trim() });
        console.log('Nickname set/updated for Google user:', nickname.trim());
      } catch (e) {
        console.error('Failed to set Google nickname', e);
      }
    }

    onClose();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}


  function continueAsGuest() {
    alert('👋 Welcome, Guest! Some features will need login later.');
    onClose();
  }

  return (
    <div className="login-modal">
      <div className="login-overlay" onClick={onClose} />
      <div className="login-card">
        <button className="close-btn" onClick={onClose}>
          ×
        </button>
        <h2
          style={{
            color: '#9370db',
            textAlign: 'center',
            marginBottom: '1rem'
          }}
        >
          Welcome! 💜
        </h2>
        <p
          style={{
            textAlign: 'center',
            marginBottom: '2rem',
            color: '#666'
          }}
        >
          Sign in to get the full experience
        </p>

        <div
          className="login-tabs"
          style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}
        >
          <button
            className={`tab-btn ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Login
          </button>
          <button
            className={`tab-btn ${tab === 'signup' ? 'active' : ''}`}
            onClick={() => setTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {tab === 'login' ? (
          <div id="loginForm">
            <input
              type="email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              placeholder="Email"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <button
              onClick={handleEmailLogin}
              style={{
                width: '100%',
                background: '#9370db',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              Login
            </button>
          </div>
        ) : (
          <div id="signupForm">
            <input
              type="text"
              value={signupName}
              onChange={(e) => setSignupName(e.target.value)}
              placeholder="Your Name (nickname)"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <input
              type="email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              placeholder="Email"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <input
              type="password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              placeholder="Password"
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '2px solid #ddd',
                borderRadius: '8px'
              }}
            />
            <button
              onClick={handleEmailSignup}
              style={{
                width: '100%',
                background: '#9370db',
                color: 'white',
                border: 'none',
                padding: '0.75rem',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              Sign Up
            </button>
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            background: 'white',
            color: '#333',
            border: '2px solid #ddd',
            padding: '0.75rem',
            borderRadius: '8px',
            cursor: 'pointer',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <span>🔐</span> Sign in with Google
        </button>

        <button
          onClick={continueAsGuest}
          style={{
            width: '100%',
            background: 'transparent',
            color: '#9370db',
            border: '2px solid #9370db',
            padding: '0.75rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

function ThemeSwitcher({ currentTheme, onChangeTheme }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  function handleSelect(key) {
    onChangeTheme(key);
    setOpen(false);
  }

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        className="theme-button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: '#ffb7d5',
          color: '#fff',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        💜
      </button>

      {open && (
        <div
          className="theme-dropdown"
          id="themeDropdown"
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
            padding: '0.5rem',
            minWidth: '220px',
            zIndex: 999
          }}
        >
          {Object.entries(eraThemes).map(([key, era]) => (
            <div
              className="theme-option"
              key={key}
              onClick={() => handleSelect(key)}
              title={era.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.35rem 0.5rem',
                cursor: 'pointer',
                borderRadius: '8px',
                background:
                  currentTheme === key ? 'rgba(147,112,219,0.08)' : 'transparent'
              }}
            >
              <div
                className="theme-color"
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: era.bg || '#ffffff'
                }}
              />
              <span style={{ fontSize: '0.9rem' }}>{era.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


function MemberSelection({ setActiveSection }) {
  return (
    <div className="section active" id="memberSelection">
      <h1
        style={{
          textAlign: 'center',
          marginBottom: '4rem',
          color: '#9370db',
        }}
      >
        Choose Your Member 💜
      </h1>

      <div className="member-grid">
        <div
          className="member-card"
          style={{ background: '#61C3DC' }}
          onClick={() => setActiveSection('quotes')}
        >
          <div className="member-emoji">🎤</div>
          <div className="member-name">RM</div>
          <div>Trivia 承: HUGS 🫂</div>
        </div>

        <div
          className="member-card"
          style={{ background: '#F1EDEA' }}
          onClick={() => setActiveSection('trivia')}
        >
          <div className="member-emoji">🎮</div>
          <div className="member-name">Jin</div>
          <div>Trivia 承: GAME</div>
        </div>

        <div
          className="member-card"
          style={{ background: '#EE993F' }}
          onClick={() => setActiveSection('music')}
        >
          <div className="member-emoji">🍜</div>
          <div className="member-name">Suga</div>
          <div>Trivia 承: FOOD</div>
        </div>

        <div
          className="member-card"
          style={{ background: '#AD9AFF' }}
          onClick={() => setActiveSection('gallery')}
        >
          <div className="member-emoji">☀️</div>
          <div className="member-name">J-Hope</div>
          <div>Trivia 承: OOTD</div>
        </div>

        <div
          className="member-card"
          style={{ background: '#F3D400' }}
          onClick={() => setActiveSection('quiz')}
        >
          <div className="member-emoji">🎵</div>
          <div className="member-name">Jimin</div>
          <div>Trivia 承: MUSIC</div>
        </div>

        <div
          className="member-card"
          style={{ background: '#EC2029' }}
          onClick={() => setActiveSection('arsd')}
        >
          <div className="member-emoji">📸</div>
          <div className="member-name">V</div>
          <div>Trivia 承: ARSD</div>
        </div>

        <div
          className="member-card"
          style={{ background: '#f297caff' }}
          onClick={() => setActiveSection('timeline')}
        >
          <div className="member-emoji">🕛</div>
          <div className="member-name">Jungkook</div>
          <div>Trivia 承: Timeline</div>
        </div>

        <div
          className="member-card"
          style={{ background: '#999999' }}
          onClick={() => setActiveSection('army')}
        >
          <div className="member-emoji">💜</div>
          <div className="member-name">BTS</div>
          <div>Trivia 承: ARMY</div>
        </div>
      </div>
    </div>
  );
}

function TigerGame({ onBack, tigerImg, whistle, fart, choti, currentUser }) {
  console.log('TigerGame currentUser =', currentUser);
  const gameRef = useRef(null);
  const birdRef = useRef(null);
  const scoreRef = useRef(null);
  const overRef = useRef(null);
  const finalScoreRef = useRef(null);

  const fartSoundRef = useRef(null);
  const bgMusicRef = useRef(null);
  const gameOverSoundRef = useRef(null);

  const birdYRef = useRef(250);
  const birdVelRef = useRef(0);
  const gravityRef = useRef(0.5);
  const scoreValRef = useRef(0);
  const pipesRef = useRef([]);
  const gameLoopRef = useRef(null);
  const pipeIntervalRef = useRef(null);

  const [isStarted, setIsStarted] = useState(false);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [highScore, setHighScore] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  

  // Sounds setup + cleanup
  useEffect(() => {
    fartSoundRef.current = new Audio(fart);
    bgMusicRef.current = new Audio(whistle);
    gameOverSoundRef.current = new Audio(choti);

    bgMusicRef.current.loop = true;
    fartSoundRef.current.volume = 1.0;
    bgMusicRef.current.volume = 0.5;
    gameOverSoundRef.current.volume = 1.0;

    return () => {
      clearInterval(gameLoopRef.current);
      clearInterval(pipeIntervalRef.current);

      if (bgMusicRef.current) {
        bgMusicRef.current.pause();
        bgMusicRef.current.currentTime = 0;
      }
      if (gameOverSoundRef.current) {
        gameOverSoundRef.current.pause();
        gameOverSoundRef.current.currentTime = 0;
      }
      if (fartSoundRef.current) {
        fartSoundRef.current.pause();
        fartSoundRef.current.currentTime = 0;
      }
    };
  }, [fart, whistle, choti]);

  // Load my highscore + leaderboard using Firebase user
  useEffect(() => {
    async function init() {
      // Always load global leaderboard
      const { data: topRows } = await supabase
        .from('jin_highscores')
        .select('nickname, score')
        .order('score', { ascending: false })
        .limit(3);
      setLeaderboard(topRows || []);

      if (!currentUser) {
        setHighScore(null);
        return;
      }

      const { data: myRow } = await supabase
        .from('jin_highscores')
        .select('score')
        .eq('user_id', currentUser.uid)
        .maybeSingle();
      if (myRow) setHighScore(myRow.score);
    }
    init();
  }, [currentUser]);

  function createPipe() {
    const gameContainer = gameRef.current;
    if (!gameContainer) return;

    const gap = Math.random() * 250 + 100;
    const topHeight = gap;
    const bottomHeight = 600 - gap - 150;

    const topPipe = document.createElement('div');
    topPipe.className = 'pipe pipe-top';
    topPipe.style.height = topHeight + 'px';
    topPipe.style.left = '400px';

    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe pipe-bottom';
    bottomPipe.style.height = bottomHeight + 'px';
    bottomPipe.style.left = '400px';

    gameContainer.appendChild(topPipe);
    gameContainer.appendChild(bottomPipe);

    pipesRef.current.push({
      x: 400,
      gap: topHeight,
      top: topPipe,
      bottom: bottomPipe,
      scored: false
    });
  }

  function startGame() {
    const bird = birdRef.current;
    const gameContainer = gameRef.current;
    const scoreDisplay = scoreRef.current;
    const gameOverScreen = overRef.current;

    if (!bird || !gameContainer || !scoreDisplay) return;

    setIsStarted(true);
    setHasPlayedOnce(true);
    if (gameOverScreen) gameOverScreen.classList.add('hidden');

    scoreValRef.current = 0;
    birdYRef.current = 250;
    birdVelRef.current = 0;
    pipesRef.current = [];
    scoreDisplay.textContent = '0';

    gameContainer.querySelectorAll('.pipe').forEach((p) => p.remove());

    clearInterval(gameLoopRef.current);
    clearInterval(pipeIntervalRef.current);

    const bg = bgMusicRef.current;
    if (bg) {
      bg.pause();
      bg.currentTime = 0;
      bg.play().catch(() => {});
    }

    const over = gameOverSoundRef.current;
    if (over) {
      over.pause();
      over.currentTime = 0;
    }

    gameLoopRef.current = setInterval(updateGame, 20);
    pipeIntervalRef.current = setInterval(createPipe, 2000);
    createPipe();
  }

  async function handleHighScoreUpdate() {
  if (!currentUser) {
    console.log('No Firebase user, skip highscore');
    return;
  }

  const newScore = scoreValRef.current;
  console.log('Checking highscore', { newScore, old: highScore });

  if (highScore !== null && newScore <= highScore) return;

  setHighScore(newScore);

  const { data, error } = await supabase
    .from('jin_highscores')
    .upsert(
      {
        user_id: currentUser.uid,
        nickname:
          currentUser.displayName ||
          currentUser.email ||
          'ARMY',
        score: newScore
      },
      { onConflict: 'user_id' }
    )
    .select();
  console.log('upsert result =', data, error);

  const { data: topRows } = await supabase
    .from('jin_highscores')
    .select('nickname, score')
    .order('score', { ascending: false })
    .limit(3);
  setLeaderboard(topRows || []);

  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 }
  });
}

  async function endGame() {
    const gameOverScreen = overRef.current;
    const finalScoreDisplay = finalScoreRef.current;

    clearInterval(gameLoopRef.current);
    clearInterval(pipeIntervalRef.current);
    setIsStarted(false);

    const bg = bgMusicRef.current;
    const over = gameOverSoundRef.current;
    if (bg) {
      bg.pause();
      bg.currentTime = 0;
    }
    if (over) {
      over.pause();
      over.currentTime = 0;
      over.play().catch(() => {});
    }

    if (finalScoreDisplay) {
      finalScoreDisplay.textContent = `Score: ${scoreValRef.current}`;
    }

    const gameContainer = gameRef.current;
    if (gameContainer) {
      gameContainer.querySelectorAll('.pipe').forEach((p) => p.remove());
    }
    pipesRef.current = [];

    if (gameOverScreen) {
      gameOverScreen.classList.remove('hidden');
    }

    handleHighScoreUpdate();
  }

  function restartGame() {
    startGame();
  }

  function updateGame() {
    const bird = birdRef.current;
    const scoreDisplay = scoreRef.current;

    if (!bird || !scoreDisplay) return;

    birdVelRef.current += gravityRef.current;
    birdYRef.current += birdVelRef.current;
    bird.style.top = birdYRef.current + 'px';

    const rotation = Math.min(Math.max(birdVelRef.current * 3, -30), 90);
    bird.style.transform = `rotate(${rotation}deg)`;

    if (birdYRef.current > 540 || birdYRef.current < 0) {
      endGame();
      return;
    }

    pipesRef.current.forEach((pipe, index) => {
      pipe.x -= 3;
      pipe.top.style.left = pipe.x + 'px';
      pipe.bottom.style.left = pipe.x + 'px';

      if (!pipe.scored && pipe.x < 80) {
        scoreValRef.current += 1;
        scoreDisplay.textContent = String(scoreValRef.current);
        pipe.scored = true;
      }

      if (pipe.x < -60) {
        pipe.top.remove();
        pipe.bottom.remove();
        pipesRef.current.splice(index, 1);
      }

      if (pipe.x < 140 && pipe.x > 20) {
        if (
          birdYRef.current < pipe.gap ||
          birdYRef.current > pipe.gap + 150
        ) {
          endGame();
        }
      }
    });
  }

  function flap() {
    birdVelRef.current = -7;

    if (Math.random() < 0.3) {
      const fartA = fartSoundRef.current;
      if (fartA) {
        fartA.pause();
        fartA.currentTime = 0;
        fartA.play().catch(() => {});
      }
    }
  }

  useEffect(() => {
    function onKey(e) {
      if (e.code === 'Space') {
        e.preventDefault();
        flap();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  function handleBack() {
    clearInterval(gameLoopRef.current);
    clearInterval(pipeIntervalRef.current);

    if (bgMusicRef.current) {
      bgMusicRef.current.pause();
      bgMusicRef.current.currentTime = 0;
    }
    if (gameOverSoundRef.current) {
      gameOverSoundRef.current.pause();
      gameOverSoundRef.current.currentTime = 0;
    }
    if (fartSoundRef.current) {
      fartSoundRef.current.pause();
      fartSoundRef.current.currentTime = 0;
    }

    onBack();
  }

  return (
    <div className="section">
      <button className="back-button" onClick={handleBack}>
        ← Back
      </button>

      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#9370db', marginBottom: '1rem' }}>
          Trivia 承: Game
        </h2>
        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Tap / click to make JIN jump. Don&apos;t hit the pipes!
        </p>

        {currentUser && highScore !== null ? (
          <p
            style={{
              marginBottom: '0.5rem',
              color: '#444',
              fontSize: '0.9rem'
            }}
          >
            Your high score: <strong>{highScore}</strong>
          </p>
        ) : !currentUser ? (
          <p
            style={{
              marginBottom: '0.5rem',
              color: '#888',
              fontSize: '0.85rem'
            }}
          >
            Log in to save your high score and join the leaderboard.
          </p>
        ) : null}

        {!isStarted && !hasPlayedOnce && (
          <button
            className="back-button"
            style={{ marginBottom: '1rem' }}
            onClick={startGame}
          >
            Start Game
          </button>
        )}

        <div
          id="gameContainer"
          ref={gameRef}
          onClick={flap}
          style={{
            position: 'relative',
            width: '400px',
            height: '600px',
            margin: '0 auto',
            overflow: 'hidden',
            borderRadius: '16px',
            background:
              'linear-gradient(180deg, #87ceeb 0%, #e0f7ff 60%, #f5deb3 100%)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}
        >
          <div
            ref={scoreRef}
            id="score"
            style={{
              position: 'absolute',
              top: '10px',
              left: '50%',
              transform: 'translateX(-50%)',
              fontSize: '2rem',
              fontWeight: 'bold',
              color: '#fff',
              textShadow: '0 2px 4px rgba(0,0,0,0.5)'
            }}
          >
            0
          </div>

          <img
            ref={birdRef}
            id="bird"
            src={tigerImg}
            alt="Tiger"
            style={{
              position: 'absolute',
              left: '80px',
              top: '250px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
              transition: 'transform 0.1s linear'
            }}
          />

          <div
            ref={overRef}
            id="gameOverScreen"
            className="hidden"
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.6rem' }}>
              Game Over
            </h3>
            <p
              ref={finalScoreRef}
              id="finalScore"
              style={{ marginBottom: '1rem' }}
            >
              Score: 0
            </p>
            <button
              id="restartBtn"
              className="back-button"
              style={{ marginBottom: 0 }}
              onClick={(e) => {
                e.stopPropagation();
                restartGame();
              }}
            >
              Play Again
            </button>
          </div>
        </div>

        {leaderboard.length > 0 && (
          <div style={{ marginTop: '1.5rem', textAlign: 'left' }}>
            <h3
              style={{
                fontSize: '1rem',
                marginBottom: '0.5rem',
                color: '#9370db'
              }}
            >
              Top 3 JIN gamers 🎮
            </h3>
            <ol
              style={{
                paddingLeft: '1.2rem',
                margin: 0,
                fontSize: '0.9rem',
                color: '#444'
              }}
            >
              {leaderboard.map((row, idx) => (
                <li key={idx}>
                  {row.nickname || 'ARMY'} — <strong>{row.score}</strong>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}

function RecipesSection({ onBack }) {
  // Inline recipe data (replace / extend as you like)
  const sugaRecipes = [
    {
      title: 'Jin’s Spicy Kimchi Fried Rice',
      member: 'Jin',
      note: 'Perfect for late-night practice hunger and rainy days.',
      ingredients: [
        'Cooked rice (1–2 bowls, preferably cold)',
        'Kimchi + a little kimchi juice',
        'Gochujang (Korean chili paste)',
        'Sesame oil & vegetable oil',
        'Eggs & spring onion',
        'Sesame seeds (optional)'
      ],
      steps: [
        'Heat oil in a pan and sauté chopped kimchi until fragrant.',
        'Add a spoon of gochujang and mix well with the kimchi.',
        'Add cooked rice and stir-fry until everything is evenly coated.',
        'Drizzle sesame oil, then push rice aside and fry an egg in the same pan.',
        'Top the rice with the fried egg, garnish with spring onion and sesame seeds.'
      ],
      source: 'Inspired by Jin’s Eat Jin episodes'
    },
    {
      title: 'Suga’s Midnight Ramyeon',
      member: 'Suga',
      note: 'Simple comfort food for when you can’t sleep.',
      ingredients: [
        'Instant ramyeon (1 packet)',
        'Egg',
        'Green onion',
        'Cheese slice (optional)',
        'Kimchi on the side'
      ],
      steps: [
        'Boil water and cook ramyeon with the seasoning packet.',
        'When noodles are almost done, crack in an egg and let it poach gently.',
        'Add chopped green onion before turning off the heat.',
        'Top with a cheese slice if you like it extra creamy.',
        'Serve hot with kimchi on the side.'
      ],
      source: 'Inspired by various BTS livestreams'
    },
    {
      title: 'Namjoon’s Avocado Toast',
      member: 'RM',
      note: 'A quick, healthy breakfast before a busy schedule.',
      ingredients: [
        'Bread slices (toasted)',
        'Ripe avocado',
        'Salt & pepper',
        'Cherry tomatoes',
        'Olive oil & lemon juice'
      ],
      steps: [
        'Toast the bread until golden.',
        'Mash avocado with salt, pepper and a squeeze of lemon.',
        'Spread the avocado mix over the toast.',
        'Top with sliced cherry tomatoes and a drizzle of olive oil.',
        'Serve immediately with coffee or tea.'
      ],
      source: 'Inspired by RM’s love for simple healthy food'
    }
    // Add more recipe objects here if you want
  ];

  const [current, setCurrent] = useState(
    sugaRecipes[Math.floor(Math.random() * sugaRecipes.length)]
  );

  function nextRecipe() {
    const idx = Math.floor(Math.random() * sugaRecipes.length);
    setCurrent(sugaRecipes[idx]);
  }

  return (
    <div className="section" id="recipes">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#9370db', marginBottom: '1.5rem' }}>
          BTS Recipe Suggestion 🍜
        </h2>

        <h3 style={{ marginBottom: '0.5rem' }}>{current.title}</h3>
        <p style={{ marginBottom: '0.5rem', fontStyle: 'italic' }}>
          Recommended by {current.member}
        </p>
        <p style={{ marginBottom: '1.2rem', color: '#555' }}>{current.note}</p>

        <div
          style={{
            textAlign: 'left',
            maxWidth: '480px',
            margin: '0 auto',
            fontSize: '0.9rem'
          }}
        >
          <h4 style={{ marginBottom: '0.4rem', color: '#9370db' }}>
            Ingredients
          </h4>
          <ul style={{ paddingLeft: '1.1rem', marginBottom: '0.9rem' }}>
            {current.ingredients.map((item) => (
              <li key={item} style={{ marginBottom: '0.2rem' }}>
                {item}
              </li>
            ))}
          </ul>

          <h4 style={{ marginBottom: '0.4rem', color: '#9370db' }}>
            Steps
          </h4>
          <ol style={{ paddingLeft: '1.1rem' }}>
            {current.steps.map((step, index) => (
              <li key={index} style={{ marginBottom: '0.3rem' }}>
                {step}
              </li>
            ))}
          </ol>

          {current.source && (
            <p
              style={{
                marginTop: '0.9rem',
                fontSize: '0.8rem',
                color: '#777',
                fontStyle: 'italic'
              }}
            >
              Source: {current.source}
            </p>
          )}
        </div>

        <div style={{ marginTop: '1.8rem' }}>
          <button className="back-button" onClick={nextRecipe}>
            New Suggestion
          </button>
        </div>
      </div>
    </div>
  );
}

function QuotesSection({ onBack }) {
  const rmVideos = [
    { id: '-r2lC6lAvqs', title: 'RM Clip 1' },
    { id: '-sF9UT0oCh0', title: 'RM Clip 2' },
    { id: '_hRtzO_kr6k', title: 'RM Clip 3' },
    { id: '98-JdOLL0OQ', title: 'RM Clip 4' },
    { id: 'ZDoXYlQ2O6w', title: 'RM Clip 5' },
    { id: 'kZVZ5ScNngI', title: 'RM Clip 6' },
    { id: 'jNbryGhARmI', title: 'RM Clip 7' },      // short
    { id: 'Ahj1ADoaiXE', title: 'RM Clip 8' },     // short
    { id: 'N-cP7pMkNcs', title: 'RM Clip 9' },     // short
    { id: 'nyBkXgeLuWo', title: 'RM Clip 10' },    // short
    { id: 'gtPEpAoMoy8', title: 'RM Clip 11' },    // short
    { id: 'Szjc06DScMc', title: 'RM Clip 12' },    // short
    { id: 'CKP-yxGIJLQ', title: 'RM Clip 13' },    // short
    { id: 'j6PJCeh5xNc', title: 'RM Clip 14' },
    { id: 'EnOcjVPzIJA', title: 'RM Clip 15' },
    { id: 'T3YZZMjMGL4', title: 'RM Clip 16' },
    { id: 'YyybVI_SNQk', title: 'RM Clip 17' },
    { id: 'JbKU3ueC5Ks', title: 'RM Clip 18' },
    { id: 'fvNZB4Ltf7I', title: 'RM Clip 19' },
    { id: 'vcdTJxeG2Qk', title: 'RM Clip 20' },
    { id: 'Z42Fw9qtl8I', title: 'RM Clip 21' },
    { id: 's0IoudKE_7A', title: 'RM Clip 22' },
    { id: 'fzJJX9KlTCA', title: 'RM Clip 23' }
  ];

  const [currentVideo, setCurrentVideo] = useState(rmVideos[0]);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * rmVideos.length);
    setCurrentVideo(rmVideos[randomIndex]);
  }, []);

  return (
    <div className="section" id="quotes">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="card quote-card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#9370db', marginBottom: '1.5rem' }}>
          Here's a virtual hug for you💭
        </h2>
        <p style={{ marginBottom: '1rem', color: '#555' }}>
          A random bangtan clip every time you visit. Let their words find you when you need them most.
        </p>

        <div
          style={{
            position: 'relative',
            paddingBottom: '56.25%',
            height: 0,
            overflow: 'hidden',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
            marginBottom: '0.75rem'
          }}
        >
          <iframe
            title={currentVideo.title}
            src={`https://www.youtube.com/embed/${currentVideo.id}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 0,
              borderRadius: '12px'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        <div style={{ fontSize: '0.85rem', color: '#777', marginBottom: '0.5rem' }}>
          Vid credits @jinev.97 &amp; other editmys
        </div>
        <div style={{ fontSize: '0.85rem', color: '#999' }}>
          Refresh the page to see a different clip.
        </div>
      </div>
    </div>
  );
}

function GallerySection({ onBack, currentUser }) {
  const CARD_COUNT = 7;

  const [outfits, setOutfits] = useState([]);
  const [loadingOutfits, setLoadingOutfits] = useState(true);

  const [cards, setCards] = useState(() =>
    Array.from({ length: CARD_COUNT }).map(() => ({
      revealed: false,
      fit: null,
    }))
  );
  const [hasPicked, setHasPicked] = useState(false);
  const [energyScore, setEnergyScore] = useState(7);
  const [submittingEnergy, setSubmittingEnergy] = useState(false);
  const [averageEnergy, setAverageEnergy] = useState(null);

  // load outfits from Supabase
  useEffect(() => {
    async function loadOutfits() {
      setLoadingOutfits(true);
      const { data, error } = await supabase
        .from('outfits')
        .select('*')
        // TEMP: remove filter while testing; re‑add .eq(...) later if you want
        // .eq('member', 'J-Hope')
        .order('id', { ascending: true });

      console.log('Outfits from Supabase', { data, error }); // debug

      if (error) {
        console.error('Error loading outfits:', error);
        setOutfits([]);
      } else {
        setOutfits(data || []);
      }
      setLoadingOutfits(false);
    }

    loadOutfits();
  }, []);

  function rearrangeDeck() {
    setCards(
      Array.from({ length: CARD_COUNT }).map(() => ({
        revealed: false,
        fit: null,
      }))
    );
    setHasPicked(false);
  }

  function pullCard(index) {
    if (hasPicked || outfits.length === 0) return;

    setCards((prev) => {
      const next = [...prev];
      const randomFit =
        outfits[Math.floor(Math.random() * outfits.length)];
      next[index] = { revealed: true, fit: randomFit };
      return next;
    });
    setHasPicked(true);
  }

  async function loadAverageEnergy() {
    const now = new Date();
    const weekAgo = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from('hope_energy')
      .select('score', { head: false })
      .gte('created_at', weekAgo);

    if (error) {
      console.error('Error loading average energy:', error);
      return;
    }

    if (!data || data.length === 0) {
      setAverageEnergy(null);
      return;
    }

    const sum = data.reduce((acc, row) => acc + row.score, 0);
    const avg = sum / data.length;
    setAverageEnergy(avg);
  }

  useEffect(() => {
    loadAverageEnergy();
  }, []);

  async function submitEnergy() {
    if (!currentUser) {
      alert('Please log in to share your energy with ARMY.');
      return;
    }

    setSubmittingEnergy(true);
    try {
      const { error } = await supabase.from('hope_energy').insert({
        uid: currentUser.uid,
        score: energyScore,
      });

      if (error) {
        console.error('Error saving energy score:', error);
        alert('Could not save your energy today. Please try again.');
        return;
      }

      alert(`✅ Your energy (${energyScore}/10) has been shared with ARMY!`);
      await loadAverageEnergy();
    } catch (e) {
      console.error(e);
      alert('Error submitting energy. Please try again.');
    } finally {
      setSubmittingEnergy(false);
    }
  }

  return (
    <div className="section" id="gallery">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="card" style={{ textAlign: 'center' }}>
        <h2
          style={{
            color: '#9370db',
            marginBottom: '1.5rem',
          }}
        >
          Hope Outfit Tarot 🧢
        </h2>
        <p
          style={{
            marginBottom: '1.2rem',
            color: '#555',
            fontSize: '0.95rem',
          }}
        >
          Hobi lays out 7 cards for you. Pick one to reveal your outfit vibe,
          then reshuffle if you want to try again.
        </p>

        {loadingOutfits && (
          <p
            style={{
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: '#777',
            }}
          >
            Loading outfits…
          </p>
        )}
        {!loadingOutfits && outfits.length === 0 && (
          <p
            style={{
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: '#777',
            }}
          >
            No outfits found yet. Add some rows in the <code>outfits</code>{' '}
            table.
          </p>
        )}

        {/* Card fan */}
        <div
          style={{
            position: 'relative',
            height: '300px',
            maxWidth: '700px',
            margin: '3rem auto 1.5rem',
          }}
        >
          {cards.map((card, index) => {
            const spread = 60;
            const totalWidth = (CARD_COUNT - 1) * spread;
            const left = index * spread;
            const centerOffset = totalWidth / 2;
            const rotation = (index - (CARD_COUNT - 1) / 2) * 3;

            return (
              <div
                key={index}
                onClick={() => pullCard(index)}
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: `calc(33% - ${centerOffset}px + ${left}px)`,
                  width: '220px',
                  height: card.revealed ? '380px' : '320px',
                  transform: card.revealed
                    ? 'translateY(-25px)'
                    : `rotate(${rotation}deg)`,
                  transformOrigin: '50% 100%',
                  transition: 'transform 0.4s ease, height 0.4s ease',
                  cursor:
                    hasPicked && !card.revealed ? 'default' : 'pointer',
                  zIndex: card.revealed ? 40 : 10 + index,
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '18px',
                    transformStyle: 'preserve-3d',
                    transition: 'transform 0.6s',
                    transform: card.revealed ? 'rotateY(180deg)' : 'none',
                    boxShadow: '0 14px 30px rgba(0, 0, 0, 0.2)',
                    background: 'linear-gradient(135deg,#fff7ff,#f4ecff)',
                  }}
                >
                  {/* Back */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      borderRadius: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      color: '#9370db',
                      fontSize: '1rem',
                      letterSpacing: '0.6px',
                      padding: '0.6rem',
                      textAlign: 'center',
                    }}
                  >
                    ✨ Pick a card ✨
                  </div>

                  {/* Front */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backfaceVisibility: 'hidden',
                      transform: 'rotateY(180deg)',
                      borderRadius: '18px',
                      padding: '0.8rem',
                      textAlign: 'left',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      background:
                        'linear-gradient(135deg, #fff, #ffeef9)',
                    }}
                  >
                    {card.fit && card.fit.image_url && (
                      <img
                        src={card.fit.image_url}
                        alt={card.fit.name}
                        style={{
                          width: '100%',
                          borderRadius: '12px',
                          marginBottom: '0.6rem',
                          objectFit: 'contain',
                          height: 'auto',
                          maxHeight: '200px',
                          backgroundColor: '#000'
                        }}

                      />
                    )}
                    <h3
                      style={{
                        marginBottom: '0.25rem',
                        fontSize: '1rem',
                      }}
                    >
                      {card.fit ? card.fit.name : 'Your outfit'}
                    </h3>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: '#9370db',
                        marginBottom: '0.35rem',
                      }}
                    >
                      Inspired by {card.fit ? card.fit.member : 'J-Hope'}
                    </p>
                    <p
                      style={{
                        fontSize: '0.82rem',
                        marginBottom: '0.3rem',
                        color: '#444',
                        flexGrow: 1,
                      }}
                    >
                      {card.fit
                        ? card.fit.description
                        : 'Tap to reveal your fit.'}
                    </p>
                    <p
                      style={{
                        fontStyle: 'italic',
                        color: '#666',
                        fontSize: '0.78rem',
                      }}
                    >
                      {card.fit ? card.fit.tip : ''}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="back-button"
          style={{ marginBottom: '1.8rem' }}
          onClick={rearrangeDeck}
        >
          Rearrange deck 🔄
        </button>

        {/* Energy slider */}
        <div
          style={{
            borderTop: '1px solid #eee',
            paddingTop: '1.5rem',
            marginTop: '0.5rem',
          }}
        >
          <h3
            style={{
              color: '#ffb347',
              marginBottom: '0.75rem',
              fontSize: '1.1rem',
            }}
          >
            Rate your sunshine energy ☀️
          </h3>

          <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            Your energy today: <strong>{energyScore} / 10</strong>
          </div>

          <input
            type="range"
            min="1"
            max="10"
            value={energyScore}
            onChange={(e) => setEnergyScore(Number(e.target.value))}
            style={{ width: '100%', marginBottom: '0.75rem' }}
          />

          <button
            className="back-button"
            onClick={submitEnergy}
            disabled={submittingEnergy}
            style={{ marginBottom: '0.75rem' }}
          >
            {submittingEnergy ? 'Sharing energy…' : 'Submit my energy'}
          </button>

          <div style={{ fontSize: '0.85rem', color: '#666' }}>
            {averageEnergy == null ? (
              <span>No ARMY energy yet this week. Be the first to share!</span>
            ) : (
              <span>
                ARMY average this week:{' '}
                <strong>{averageEnergy.toFixed(1)} / 10</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


function ArsdSection({ onBack }) {
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [selcas, setSelcas] = useState([]);

  // load existing selcas from Supabase on mount
  useEffect(() => {
    async function loadSelcas() {
      const { data, error } = await supabase
        .from('arsd_selcas')
        .select('id, name, url, uid, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error(error);
        return;
      }

      setSelcas(
        data.map((row) => ({
          id: row.id,
          name: row.name,
          url: row.url,
          uid: row.uid
        }))
      );
    }

    loadSelcas();
  }, []);

  function handleFileChange(e) {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setFileName(selected ? selected.name : '');
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      setMessage('Please log in before uploading your selca 💜');
      return;
    }

    const nickname = user.displayName || 'ARMY';

    if (!file) {
      setMessage('Please choose a photo first 💜');
      return;
    }

    try {
      setUploading(true);
      setMessage('Uploading your selca… ✨');

      // 1) upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'arsd');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!res.ok) {
        throw new Error('Cloudinary upload failed');
      }

      const data = await res.json();
      const url = data.secure_url;
      console.log('Cloudinary URL:', url);

      // 2) save metadata in Supabase, using nickname from Firebase
      const { data: inserted, error } = await supabase
        .from('arsd_selcas')
        .insert({
          uid: user.uid,
          name: nickname,
          url
        })
        .select('id, name, url, uid')
        .single();

      if (error) {
        console.error(error);
        throw error;
      }

      // 3) update local tiles with real Supabase id
      setSelcas((prev) => [inserted, ...prev]);

      setMessage('✅ Selca uploaded! Thank you for sharing 💜');
      setFile(null);
      setFileName('');
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong while uploading. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(selcaId) {
    const user = auth.currentUser;
    if (!user) return;

    const { error } = await supabase
      .from('arsd_selcas')
      .delete()
      .eq('id', selcaId)
      .eq('uid', user.uid);

    if (error) {
      console.error(error);
      alert('Could not delete selca. Please try again.');
      return;
    }

    setSelcas((prev) => prev.filter((s) => s.id !== selcaId));
  }

  const currentUser = auth.currentUser;
  const nickname = currentUser?.displayName || 'ARMY';

  return (
    <div className="section" id="arsd">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#9370db', marginBottom: '1.5rem' }}>
          ARMY Selca Day 📸
        </h2>
        <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>
          Share your bias-inspired look!
        </p>

        <form
          onSubmit={handleSubmit}
          style={{ maxWidth: '420px', margin: '0 auto', textAlign: 'left' }}
        >
          {currentUser ? (
            <p
              style={{
                marginBottom: '1rem',
                fontWeight: 500
              }}
            >
              Nickname: <strong>{nickname}</strong>
            </p>
          ) : (
            <p
              style={{
                marginBottom: '1rem',
                color: '#888',
                fontSize: '0.9rem'
              }}
            >
              Log in to use your nickname for selcas.
            </p>
          )}

          <label
            style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}
          >
            Selca photo
          </label>

          <label
            htmlFor="arsd-file"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1.3rem',
              borderRadius: '999px',
              background:
                'linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #a18cd1 100%)',
              color: '#fff',
              cursor: 'pointer',
              border: 'none',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              marginBottom: '0.75rem'
            }}
          >
            📸 Choose photo
          </label>
          <input
            id="arsd-file"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <div
            style={{
              marginBottom: '1.5rem',
              color: '#666',
              fontSize: '0.9rem'
            }}
          >
            {fileName ? `Selected: ${fileName}` : 'No file chosen yet'}
          </div>

          <button
            type="submit"
            disabled={uploading}
            style={{
              width: '100%',
              padding: '0.9rem 1.3rem',
              borderRadius: '999px',
              border: 'none',
              cursor: uploading ? 'default' : 'pointer',
              opacity: uploading ? 0.7 : 1,
              background:
                'linear-gradient(135deg, #9370db 0%, #ffb7d5 50%, #ffd93d 100%)',
              color: '#fff',
              fontSize: '1rem',
              fontWeight: 700,
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              transform: 'translateY(0)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = 'translateY(1px)';
              e.currentTarget.style.boxShadow =
                '0 2px 8px rgba(0,0,0,0.15)';
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow =
                '0 4px 14px rgba(0,0,0,0.15)';
            }}
          >
            {uploading ? 'Uploading…' : 'Upload Selca ✨'}
          </button>
        </form>

        {message && (
          <p style={{ marginTop: '1.5rem', color: '#9370db' }}>{message}</p>
        )}

        {selcas.length > 0 && (
          <div style={{ marginTop: '2.5rem', textAlign: 'left' }}>
            <h3
              style={{
                color: '#9370db',
                marginBottom: '1rem',
                textAlign: 'center'
              }}
            >
              Your ARMY selca tiles 💜
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                gap: '1.5rem'
              }}
            >
              {selcas.map((s) => (
                <div
                  key={s.id}
                  className="card"
                  style={{
                    padding: '0',
                    overflow: 'hidden',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    background: '#fff'
                  }}
                >
                  <img
                    src={s.url}
                    alt={s.name}
                    style={{
                      width: '100%',
                      height: '220px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ padding: '1rem 1.25rem' }}>
                    <h4
                      style={{
                        margin: '0 0 0.25rem',
                        color: '#333',
                        fontSize: '1.05rem'
                      }}
                    >
                      {s.name}
                    </h4>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '0.9rem',
                        color: '#9370db'
                      }}
                    >
                      ARMY Selca
                    </p>

                    {currentUser && currentUser.uid === s.uid && (
                      <button
                        onClick={() => handleDelete(s.id)}
                        style={{
                          marginTop: '0.5rem',
                          padding: '0.35rem 0.8rem',
                          borderRadius: '999px',
                          border: 'none',
                          background: '#f56565',
                          color: '#fff',
                          fontSize: '0.8rem',
                          cursor: 'pointer'
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimelineSection({ onBack, onCelebrate }) {
  const [achTitle, setAchTitle] = useState('');
  const [achList, setAchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadAchievements() {
      setLoading(true);
      setError('');
      const { data, error } = await supabase
        .from('bts_achievements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error(error);
        setError('Could not load achievements.');
      } else {
        setAchList(data || []);
      }
      setLoading(false);
    }
    loadAchievements();
  }, []);

  async function addAchievement(e) {
    e.preventDefault();
    if (!achTitle.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      setError('Please log in to add an achievement.');
      return;
    }

    const nickname = user.displayName || 'ARMY';

    setSaving(true);
    setError('');

    const newItem = {
      title: achTitle.trim(),
      nickname
    };

    const { data, error } = await supabase
      .from('bts_achievements')
      .insert(newItem)
      .select();

    if (error) {
      console.error(error);
      if (error.code === '23505') {
        setError('This nickname is already used, try another one.');
      } else {
        setError('Could not save. Please try again.');
      }
    } else if (data && data.length > 0) {
      setAchList((prev) => [data[0], ...prev]);
      setAchTitle('');
      if (onCelebrate) {
        onCelebrate();
      }
    }

    setSaving(false);
  }

  async function deleteAchievement(id) {
    const prev = achList;
    setAchList((list) => list.filter((a) => a.id !== id));

    const { error } = await supabase
      .from('bts_achievements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      setAchList(prev);
    }
  }

  const currentUser = auth.currentUser;
  const nickname = currentUser?.displayName || 'ARMY';

  return (
    <div className="section" id="timeline">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <h2 style={{ color: '#9370db', marginBottom: '0.5rem' }}>
        BTS Timeline 📅
      </h2>
      <p className="timeline-era">
        From rock bottom to record‑breaking heights: Key moments in BTS & your life.
      </p>

      {/* Static BTS timeline */}
      <div>
        {timeline.map((event) => (
          <div key={event.date + event.title} className="timeline-event">
            <div className="timeline-date">
              {new Date(event.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
            <div className="timeline-title">{event.title}</div>
            <div>{event.description}</div>
          </div>
        ))}
      </div>

      {/* Shared ARMY achievements */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <h3
          style={{ color: '#9370db', marginBottom: '0.5rem', textAlign: 'center' }}
        >
          Your Achievements 🏅
        </h3>
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.9rem',
            color: '#666',
            marginBottom: '1rem'
          }}
        >
          Little milestones from ARMYs everywhere.
        </p>

        {currentUser ? (
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#444',
              marginBottom: '0.75rem'
            }}
          >
            Posting as <strong>{nickname}</strong>
          </p>
        ) : (
          <p
            style={{
              textAlign: 'center',
              fontSize: '0.9rem',
              color: '#888',
              marginBottom: '0.75rem'
            }}
          >
            Log in to post achievements with your nickname.
          </p>
        )}

        <form
          onSubmit={addAchievement}
          style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <input
            type="text"
            value={achTitle}
            onChange={(e) => setAchTitle(e.target.value)}
            placeholder="Your achievement"
            style={{
              flex: 2,
              minWidth: '200px',
              padding: '0.6rem 0.8rem',
              border: '2px solid #ddd',
              borderRadius: '8px'
            }}
          />
          <button
            type="submit"
            className="back-button"
            style={{ marginBottom: 0, whiteSpace: 'nowrap' }}
            disabled={saving}
          >
            {saving ? 'Adding…' : 'Add'}
          </button>
        </form>

        {error && (
          <p style={{ color: 'tomato', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
            {error}
          </p>
        )}

        {loading ? (
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Loading achievements…</p>
        ) : achList.length === 0 ? (
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Add little moments you’re proud of as an ARMY.
          </p>
        ) : (
          <div>
            {achList.map((a) => (
              <div key={a.id} className="timeline-event">
                <div className="timeline-date">
                  {a.created_at
                    ? new Date(a.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })
                    : ''}
                </div>
                <div
                  className="timeline-title"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <span>{a.title}</span>
                  <button
                    type="button"
                    onClick={() => deleteAchievement(a.id)}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#999',
                      cursor: 'pointer',
                      fontSize: '0.85rem'
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#777' }}>
                  Shared by {a.nickname || 'ARMY'}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


function ArmyDaySection({ onBack, currentUser, setArmyDateFromDb }) {
  const [armyDate, setArmyDate] = useState('2013-07-09');
  const [daysAsArmy, setDaysAsArmy] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');

  function calculateDays(dateStr = armyDate) {
    const start = new Date(dateStr);
    const today = new Date();
    const diff = Math.floor(
      (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
    );
    setDaysAsArmy(diff >= 0 ? diff : 0);
  }

  // 1) Load saved army_date from Supabase when user is known
  useEffect(() => {
    async function loadArmyDate() {
      if (!currentUser) return;

      setLoadError('');
      const { data, error } = await supabase
        .from('army_profiles')
        .select('army_date')
        .eq('uid', currentUser.uid)
        .maybeSingle();

      if (error) {
        console.error('loadArmyDate error', error);
        setLoadError('Could not load saved ARMY date.');
        return;
      }

      if (data && data.army_date) {
  const dateStr = data.army_date; // 'YYYY-MM-DD'
  setArmyDate(dateStr);
  calculateDays(dateStr);
  if (typeof setArmyDateFromDb === 'function') {
    setArmyDateFromDb(dateStr);
  }
} else {
  // no saved date → use default + days from that
  const defaultDate = '2013-07-09';
  setArmyDate(defaultDate);
  calculateDays(defaultDate);
  if (typeof setArmyDateFromDb === 'function') {
    setArmyDateFromDb(defaultDate);
  }
}
    }

    loadArmyDate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  // 2) On first render (no user) compute days from default
  useEffect(() => {
    if (!currentUser) {
      calculateDays('2013-07-09');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to Supabase when user changes date
  async function handleDateChange(e) {
    const newDate = e.target.value;
    setArmyDate(newDate);
    calculateDays(newDate);

    if (!currentUser) return;

    setSaving(true);
    const { error } = await supabase
      .from('army_profiles')
      .upsert(
        {
          uid: currentUser.uid,
          army_date: newDate
        },
        { onConflict: 'uid' }
      ); // [web:215]

    if (error) {
      console.error('save army_date error', error);
    }
    setSaving(false);
  }

  return (
    <div className="section" id="army">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#9370db', marginBottom: '1.5rem' }}>
          ARMY Anniversary 💜
        </h2>
        <p style={{ marginBottom: '1rem' }}>When did you become ARMY?</p>

        {currentUser ? (
          <p
            style={{
              marginBottom: '0.5rem',
              fontSize: '0.9rem',
              color: '#666'
            }}
          >
            We will remember this date.
          </p>
        ) : (
          <p
            style={{
              marginBottom: '0.5rem',
              fontSize: '0.85rem',
              color: '#888'
            }}
          >
            Log in to save your ARMY date across visits.
          </p>
        )}

        <input
          type="date"
          value={armyDate}
          onChange={handleDateChange}
          style={{
            padding: '0.75rem',
            border: '2px solid #ddd',
            borderRadius: '8px',
            marginBottom: '1.5rem'
          }}
        />

        {saving && currentUser && (
          <p style={{ fontSize: '0.8rem', color: '#9370db' }}>Saving…</p>
        )}
        {loadError && (
          <p style={{ fontSize: '0.8rem', color: 'tomato' }}>{loadError}</p>
        )}

        <div style={{ fontSize: '3rem', margin: '2rem 0' }}>
          {daysAsArmy.toLocaleString()}
        </div>
        <p style={{ fontSize: '1.2rem' }}>days as ARMY</p>

        <button
          onClick={() => calculateDays()}
          className="back-button"
          style={{ marginTop: '1.5rem' }}
        >
          Submit
        </button>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <MonsterStreamersSectionEmbedded currentUser={currentUser} />
      </div>
    </div>
  );
}


function MonsterStreamersSectionEmbedded({ currentUser }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingScore, setUpdatingScore] = useState(false);
  const [prevRank, setPrevRank] = useState(null);

  function fireConfetti() {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#9370db', '#ff7a7a', '#1DB954', '#FFD93D']
    });
  }

  async function loadLeaderboard() {
    setLoading(true);

    const { data, error } = await supabase
      .from('monster_streamers')
      .select('uid, total_minutes')
      .order('total_minutes', { ascending: false })
      .limit(7);

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const results = [];

    for (const row of data) {
      const { data: link, error: linkError } = await supabase
        .from('lastfm_links')
        .select('lastfm_username')
        .eq('uid', row.uid)
        .maybeSingle();

      if (linkError) {
        console.error(linkError);
      }

      results.push({
        uid: row.uid,
        total_minutes: row.total_minutes,
        display_name: link?.lastfm_username || 'Unknown ARMY'
      });
    }

    setRows(results);
    setLoading(false);
  }

  useEffect(() => {
    loadLeaderboard(); // only loads, no confetti here
  }, []);

  async function updateMyMonsterScore() {
    if (!currentUser) {
      alert('Please log in first.');
      return;
    }

    setUpdatingScore(true);

    try {
      const { data: lastfmLink, error: linkError } = await supabase
        .from('lastfm_links')
        .select('lastfm_username')
        .eq('uid', currentUser.uid)
        .maybeSingle();

      if (linkError || !lastfmLink?.lastfm_username) {
        alert('Please connect your Last.fm username first in the account menu.');
        return;
      }

      const res = await fetch('http://127.0.0.1:4000/lastfm/minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: lastfmLink.lastfm_username })
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error('Last.fm backend error:', errorData);
        alert('Failed to fetch Last.fm data. Check console.');
        return;
      }

      const { minutes } = await res.json();
      console.log(`Last.fm returned ${minutes} BTS minutes`);

      const { error: updateError } = await supabase
        .from('monster_streamers')
        .upsert(
          { uid: currentUser.uid, total_minutes: minutes },
          { onConflict: 'uid' }
        );

      if (updateError) {
        console.error('Supabase update error:', updateError);
        alert('Could not save score. Check console.');
        return;
      }

      alert(`✅ Updated! Your score: ${minutes} BTS minutes this week`);

      // Reload leaderboard and compute new rank from fresh results
      const { data, error } = await supabase
        .from('monster_streamers')
        .select('uid, total_minutes')
        .order('total_minutes', { ascending: false })
        .limit(7);

      if (error) {
        console.error(error);
        return;
      }

      const results = [];
      for (const row of data) {
        const { data: link, error: linkError } = await supabase
          .from('lastfm_links')
          .select('lastfm_username')
          .eq('uid', row.uid)
          .maybeSingle();
        if (linkError) console.error(linkError);
        results.push({
          uid: row.uid,
          total_minutes: row.total_minutes,
          display_name: link?.lastfm_username || 'Unknown ARMY'
        });
      }

      setRows(results);

      // rank change logic
      const newRank = results.findIndex((row) => row.uid === currentUser.uid);
      const inTop7 = newRank !== -1 && newRank < 7;

      if (
        inTop7 &&
        (prevRank === null || prevRank >= 7 || newRank < prevRank)
      ) {
        fireConfetti();
      }

      if (inTop7) {
        setPrevRank(newRank);
      } else {
        setPrevRank(prevRank);
      }
    } catch (e) {
      console.error(e);
      alert('Error updating score. Check console.');
    } finally {
      setUpdatingScore(false);
    }
  }

  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <h3
        style={{
          color: '#9370db',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}
      >
        🐉 Monster Streamers (Weekly)
      </h3>
      <p
        style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '1rem',
          fontSize: '0.9rem'
        }}
      >
        Top BTS streamers by total minutes from the shared stats table.
      </p>

      {currentUser && (
        <button
          onClick={updateMyMonsterScore}
          disabled={updatingScore || loading}
          style={{
            width: '100%',
            padding: '0.6rem',
            borderRadius: '8px',
            border: 'none',
            background: '#9370db',
            color: '#fff',
            fontWeight: 600,
            cursor: (updatingScore || loading) ? 'default' : 'pointer',
            opacity: (updatingScore || loading) ? 0.7 : 1,
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}
        >
          {updatingScore ? 'Updating score…' : '🔥 Update my Monster score (Last.fm)'}
        </button>
      )}

      {loading ? (
        <p>Loading leaderboard…</p>
      ) : rows.length === 0 ? (
        <p>No Monster Streamers yet. Stats will appear here once data is stored.</p>
      ) : (
        <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'left' }}>
          {rows.map((row, index) => (
            <div
              key={row.uid}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                borderRadius: '10px',
                background: 'rgba(255,255,255,0.95)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                marginBottom: '0.6rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: '#9370db',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.9rem'
                  }}
                >
                  {index + 1}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#333' }}>
                    {row.display_name}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontWeight: 700,
                  color: '#ff7a7a',
                  fontSize: '0.95rem'
                }}
              >
                {row.total_minutes} min
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuizSection({ onBack }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [resultMood, setResultMood] = useState(null);

  function choose(option) {
    const nextAnswers = [...answers, option];
    setAnswers(nextAnswers);

    if (step + 1 < quizQuestions.length) {
      setStep(step + 1);
    } else {
      // very simple mood logic based on first answer keyword
      const first = nextAnswers[0] || '';
      let mood = 'calm';
      if (first.includes('Happy')) mood = 'happy';
      else if (first.includes('Sad')) mood = 'sad';
      else if (first.includes('Anxious')) mood = 'anxious';
      else if (first.includes('Energetic')) mood = 'energetic';
      setResultMood(mood);
    }
  }

  function restart() {
    setStep(0);
    setAnswers([]);
    setResultMood(null);
  }

  const question = quizQuestions[step];

  return (
    <div className="section" id="quiz">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#9370db', marginBottom: '2rem' }}>
          Song For Your Mood 💜
        </h2>

        {!resultMood && (
          <>
            <h3 style={{ marginBottom: '1rem' }}>
              Question {step + 1} / {quizQuestions.length}
            </h3>
            <p style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>
              {question.q}
            </p>
            {question.options.map((opt) => (
              <button
                key={opt}
                onClick={() => choose(opt)}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '1rem',
                  margin: '0.5rem 0',
                  border: '2px solid #ddd',
                  background: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                {opt}
              </button>
            ))}
          </>
        )}

        {resultMood && (
          <QuizResult mood={resultMood} onRestart={restart} />
        )}
      </div>
    </div>
  );
}

function QuizResult({ mood, onRestart }) {
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
  async function fetchTrack() {
    try {
      setLoading(true);
      setError('');

      const backendUrl =
        process.env.REACT_APP_SPOTIFY_BACKEND_URL ||
        'https://bts-spotify-backend.onrender.com';

      const res = await fetch(`${backendUrl}/spotify/random-track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood })
      });

      if (!res.ok) {
        setError('Could not fetch a track. Please try again.');
        setLoading(false);
        return;
      }

      const data = await res.json();
      setTrack(data);
      setLoading(false);
    } catch (e) {
      console.error(e);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  if (mood) {
    fetchTrack();
  }
}, [mood]);

  if (loading) {
    return <p style={{ textAlign: 'center' }}>Finding the perfect BTS song for you…</p>;
  }

  if (error || !track) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p>{error || 'No song found.'}</p>
        <button className="back-button" onClick={onRestart}>
          Take Quiz Again
        </button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h3 style={{ color: '#9370db', marginBottom: '1rem' }}>
        Your comfort song:
      </h3>
      <h2 style={{ marginBottom: '0.5rem' }}>{track.name}</h2>
      <p style={{ fontStyle: 'italic', marginBottom: '1.5rem' }}>
        {track.artist}
      </p>
      <iframe
        src={`https://open.spotify.com/embed/track/${track.id}`}
        width="100%"
        height="152"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title="BTS comfort song"
      />
      <div style={{ marginTop: '2rem' }}>
        <button className="back-button" onClick={onRestart}>
          Take Quiz Again
        </button>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <div className="footer">
      <p>Made with 💜 for an amazing friend</p>
      <div className="social-links">
        <a
          href="https://twitter.com/Minpdnim07"
          target="_blank"
          rel="noreferrer"
        >
          🐦 Twitter: @Minpdnim07
        </a>
        <a
          href="https://instagram.com/Bow_wowbamie"
          target="_blank"
          rel="noreferrer"
        >
          📷 Instagram: @Bow_wowbamie
        </a>
      </div>
    </div>
  );
}

function AccountMenu({
  user,
  onLogout,
  onConnectSpotify,
  showOpening,
  spotifyLinked,
  spotifyProfile,
  onShowLogin,      // for guests
  onEditNickname    // for logged-in nickname edit
}) {
  const [open, setOpen] = useState(false);
  const [lastfmUsername, setLastfmUsername] = useState('');
  const [hasLastfm, setHasLastfm] = useState(false);
  const [savingLastfm, setSavingLastfm] = useState(false);
  const menuRef = useRef(null);

    useEffect(() => {
    function handleClickOutside(e) {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Load Last.fm when dropdown opened and user present
  useEffect(() => {
    async function loadLastfm() {
      if (!user || !open) return;

      const { data, error } = await supabase
        .from('lastfm_links')
        .select('lastfm_username')
        .eq('uid', user.uid)
        .maybeSingle();

      if (!error && data && data.lastfm_username) {
        setLastfmUsername(data.lastfm_username);
        setHasLastfm(true);
      } else {
        setHasLastfm(false);
      }
    }

    loadLastfm();
  }, [open, user]);

  // hide entirely if opening screen
  if (showOpening) return null;

  // ---------- GUEST ----------
  if (!user) {
    return (
      <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: '#9370db',
          color: '#fff',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
        }}
      >
        FYI
      </button>

        {open && (
          <div
            style={{
              position: 'absolute',
              right: 0,
              marginTop: '8px',
              minWidth: '240px',
              background: '#fff',
              borderRadius: '12px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
              padding: '0.75rem',
              fontSize: '0.9rem',
              zIndex: 999
            }}
          >
            <div
              style={{
                marginBottom: '0.5rem',
                fontWeight: 600,
                color: '#555'
              }}
            >
              You’re exploring as a guest
            </div>
            <p
              style={{
                margin: 0,
                marginBottom: '0.75rem',
                fontSize: '0.85rem',
                color: '#666'
              }}
            >
              Log in to save your ARMY date, nicknames, and Spotify/Last.fm links.
            </p>

            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onShowLogin && onShowLogin();
              }}
              style={{
                width: '100%',
                padding: '0.5rem 0.7rem',
                borderRadius: '8px',
                border: 'none',
                background: '#9370db',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Log in / Sign up
            </button>
          </div>
        )}
      </div>
    );
  }

  // ---------- LOGGED-IN ----------
  const email = user.email || 'ARMY';

  async function handleDisconnectSpotify() {
    try {
      const { error } = await supabase
        .from('spotify_links')
        .delete()
        .eq('uid', user.uid);

      if (error) {
        console.error(error);
        alert('Could not disconnect Spotify. Please try again.');
        return;
      }

      localStorage.removeItem(`spotifyLinked_${user.uid}`);
      window.location.href = window.location.origin;
    } catch (e) {
      console.error(e);
    }
  }

  async function handleSaveLastfm() {
    if (!lastfmUsername.trim()) {
      alert('Please enter your Last.fm username first.');
      return;
    }
    try {
      setSavingLastfm(true);
      const { error } = await supabase
        .from('lastfm_links')
        .upsert(
          { uid: user.uid, lastfm_username: lastfmUsername.trim() },
          { onConflict: 'uid' }
        );

      if (error) {
        console.error(error);
        alert('Could not save Last.fm username. Please try again.');
        return;
      }

      setHasLastfm(true);
      alert('✅ Last.fm username saved!');
    } catch (e) {
      console.error(e);
    } finally {
      setSavingLastfm(false);
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: 'none',
          background: '#9370db',
          color: '#fff',
          fontWeight: 700,
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
        }}
      >
        FYI
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            marginTop: '8px',
            minWidth: '260px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
            padding: '0.75rem',
            fontSize: '0.9rem',
            zIndex: 999
          }}
        >
          <div
            style={{
              marginBottom: '0.5rem',
              fontWeight: 600,
              color: '#555'
            }}
          >
            Signed in as
          </div>
          <div
            style={{
              marginBottom: '0.75rem',
              color: '#9370db',
              wordBreak: 'break-word'
            }}
          >
            {email}
          </div>

          {/* Edit nickname */}
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              onEditNickname && onEditNickname();
            }}
            style={{
              width: '100%',
              padding: '0.4rem 0.7rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: '#f7f3ff',
              color: '#5b3ea3',
              fontWeight: 600,
              cursor: 'pointer',
              marginBottom: '0.6rem',
              fontSize: '0.85rem'
            }}
          >
            ✏️ Edit nickname
          </button>

          {spotifyLinked && spotifyProfile ? (
            <>
              <div
                style={{
                  marginBottom: '0.5rem',
                  fontSize: '0.85rem',
                  color: '#555'
                }}
              >
                Spotify:{' '}
                <strong>
                  {spotifyProfile.display_name || spotifyProfile.spotify_id}
                </strong>
              </div>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  handleDisconnectSpotify();
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.7rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#e53e3e',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '0.5rem'
                }}
              >
                Disconnect Spotify
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onConnectSpotify();
              }}
              style={{
                width: '100%',
                padding: '0.5rem 0.7rem',
                borderRadius: '8px',
                border: 'none',
                background: '#1DB954',
                color: '#fff',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '0.5rem'
              }}
            >
              🎵 Connect Spotify
            </button>
          )}

          {/* Last.fm */}
          <div
            style={{
              marginTop: '0.75rem',
              marginBottom: '0.35rem',
              fontWeight: 600,
              color: '#555'
            }}
          >
            Last.fm
          </div>

          {hasLastfm ? (
            <>
              <div
                style={{
                  marginBottom: '0.4rem',
                  fontSize: '0.85rem',
                  color: '#555'
                }}
              >
                Connected as <strong>{lastfmUsername}</strong>
              </div>
              <button
                type="button"
                onClick={async () => {
                  const { error } = await supabase
                    .from('lastfm_links')
                    .delete()
                    .eq('uid', user.uid);

                  if (error) {
                    console.error(error);
                    alert('Could not disconnect Last.fm. Please try again.');
                    return;
                  }

                  setLastfmUsername('');
                  setHasLastfm(false);
                }}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.7rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#e53e3e',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '0.6rem',
                  fontSize: '0.85rem'
                }}
              >
                Disconnect Last.fm
              </button>
            </>
          ) : (
            <>
              <input
                type="text"
                value={lastfmUsername}
                onChange={(e) => setLastfmUsername(e.target.value)}
                placeholder="Last.fm username"
                style={{
                  width: '100%',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  marginBottom: '0.4rem',
                  fontSize: '0.85rem'
                }}
              />
              <button
                type="button"
                onClick={handleSaveLastfm}
                disabled={savingLastfm}
                style={{
                  width: '100%',
                  padding: '0.4rem 0.7rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#d9235d',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: savingLastfm ? 'default' : 'pointer',
                  opacity: savingLastfm ? 0.7 : 1,
                  marginBottom: '0.6rem',
                  fontSize: '0.85rem'
                }}
              >
                {savingLastfm ? 'Saving…' : 'Save Last.fm username'}
              </button>
            </>
          )}

          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            style={{
              width: '100%',
              padding: '0.5rem 0.7rem',
              borderRadius: '8px',
              border: 'none',
              background: '#f56565',
              color: '#fff',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}

function NicknameModal({ user, onClose }) {
  const [nickname, setNickname] = useState(user?.displayName || '');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    const trimmed = nickname.trim();
    if (!trimmed) {
      alert('Please enter a nickname.');
      return;
    }

    try {
      setSaving(true);

      // 1) Update Firebase auth displayName if you are using it
      if (user.updateProfile) {
        await user.updateProfile({ displayName: trimmed });
      }

      // 2) Also store in your Supabase profile table if you have one
      // adjust table/column names to your schema
      const { error } = await supabase
        .from('army_profiles')
        .update({ nickname: trimmed })
        .eq('uid', user.uid);

      if (error) {
        console.error(error);
        alert('Could not save nickname. Please try again.');
        return;
      }

      alert('Nickname updated!');
      onClose();
    } catch (e) {
      console.error(e);
      alert('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 3000
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '1.5rem 1.75rem',
          width: '90%',
          maxWidth: '360px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.25)'
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '0.75rem', color: '#5b3ea3' }}>
          Edit nickname
        </h3>
        <p
          style={{
            marginTop: 0,
            marginBottom: '0.75rem',
            fontSize: '0.9rem',
            color: '#555'
          }}
        >
          This nickname will appear in your ARMYversary and other sections.
        </p>

        <input
          type="text"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          maxLength={24}
          style={{
            width: '100%',
            padding: '0.5rem 0.7rem',
            borderRadius: '8px',
            border: '1px solid #ddd',
            marginBottom: '0.9rem',
            fontSize: '0.9rem'
          }}
          placeholder="Your nickname"
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid #ddd',
              background: '#fff',
              color: '#555',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '8px',
              border: 'none',
              background: '#9370db',
              color: '#fff',
              fontWeight: 600,
              cursor: saving ? 'default' : 'pointer',
              opacity: saving ? 0.7 : 1,
              fontSize: '0.85rem'
            }}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

function MonsterStreamersSection({ onBack }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true);

      // 1) get top 7 by total_minutes
      const { data, error } = await supabase
        .from('monster_streamers')
        .select('uid, total_minutes')
        .order('total_minutes', { ascending: false })
        .limit(7);

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      // 2) for each uid, fetch spotify display name (if linked)
      const results = [];

      for (const row of data) {
        const { data: link, error: linkError } = await supabase
          .from('spotify_links')
          .select('display_name, spotify_id')
          .eq('uid', row.uid)
          .maybeSingle();

        if (linkError) {
          console.error(linkError);
        }

        results.push({
          uid: row.uid,
          total_minutes: row.total_minutes,
          display_name: link?.display_name || link?.spotify_id || 'Unknown ARMY'
        });
      }

      setRows(results);
      setLoading(false);
    }

    loadLeaderboard();
  }, []);

  return (
    <div className="section" id="monster-streamers">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>

      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#9370db', marginBottom: '1rem' }}>
          Monster Streamers 🐉
        </h2>
        <p style={{ marginBottom: '1.5rem', color: '#555' }}>
          Weekly top BTS streamers based on total minutes (demo data for now).
        </p>

        {loading ? (
          <p>Loading leaderboard…</p>
        ) : rows.length === 0 ? (
          <p>No Monster Streamers yet. Data will appear here once stats are stored.</p>
        ) : (
          <div style={{ maxWidth: '480px', margin: '0 auto', textAlign: 'left' }}>
            {rows.map((row, index) => (
              <div
                key={row.uid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.9)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
                  marginBottom: '0.6rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: '#9370db',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem'
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, color: '#333' }}>
                      {row.display_name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#777' }}>
                      UID: {row.uid.slice(0, 6)}…
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    color: '#ff7a7a',
                    fontSize: '0.95rem'
                  }}
                >
                  {row.total_minutes} min
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Placeholder({ title, onBack }) {
  return (
    <div className="section">
      <button className="back-button" onClick={onBack}>
        ← Back
      </button>
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ color: '#9370db', marginBottom: '1.5rem' }}>{title}</h2>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <img
            src={comingSoonGif}
            alt="Coming soon"
            style={{
              maxWidth: '420px',
              width: '100%',
              borderRadius: '12px'
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ArmyversaryRoom({ onBack, currentUser, armyDate }) {
  const [step, setStep] = useState('intro'); // intro → blow → done
  const [cakeLitState, setCakeLitState] = useState(false);
  const [matchPos, setMatchPos] = useState({ x: 0.8, y: 0.7 });
  const confettiCanvasRef = useRef(null);
  const roomConfettiRef = useRef(null);
  const musicRef = useRef(null);

  // CAMERA / HANDS
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const handLandmarkerRef = useRef(null);
  const animationFrameRef = useRef(null);

  // MIC
  const micEnabled = step === 'blow';
  const level = useMicLevel({ enabled: micEnabled });
  const aboveThresholdMsRef = useRef(0);
  const lastTsRef = useRef(performance.now());


  useEffect(() => {
  // create audio element once when room mounts
  const audio = new Audio(themeMusic);
  audio.loop = true;
  audio.volume = 0.4; // tweak
  musicRef.current = audio;

  // try to play – browser requires user interaction sometime beforehand
  audio.play().catch((err) => {
    console.warn('Could not autoplay ARMYversary music', err);
  });

  // stop when room unmounts
  return () => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
      musicRef.current = null;
    }
  };
}, []);

  // debug
  useEffect(() => {
    console.log('step =', step);
  }, [step]);

  useEffect(() => {
  if (!confettiCanvasRef.current) return;

  // create instance for this canvas only
  roomConfettiRef.current = confetti.create(confettiCanvasRef.current, {
    resize: true,    // keep in sync with window size
    useWorker: true  // smoother animation
  });

  return () => {
    if (roomConfettiRef.current) {
      roomConfettiRef.current.reset();
      roomConfettiRef.current = null;
    }
  };
}, []);


  // unified blow‑out
  function doBlowOut() {
  if (step === 'done') return;
  console.log('candles blown out (doBlowOut)');

  setCakeLitState(false);
  setStep('done');

  if (roomConfettiRef.current) {
    roomConfettiRef.current({
      particleCount: 180,
      spread: 80,
      origin: { y: 0.4 }
    });
  }
}



  // dev helpers
  function simulateHandLight() {
    console.log('(dev) light candles');
    setCakeLitState(true);
    setStep('blow');
  }
  function simulateBlowOut() {
    doBlowOut();
  }

  // Mic blow detection – less eager, ignore tiny spikes
  useEffect(() => {
    if (!micEnabled) {
      aboveThresholdMsRef.current = 0;
      lastTsRef.current = performance.now();
      return;
    }

    // watch console to tune these with your actual levels
    const threshold = 0.2;   // raise so random noise doesn’t trigger
    const neededMs = 220;     // require slightly longer blow

    let running = true;

    const check = () => {
      if (!running) return;

      const now = performance.now();
      const dt = now - lastTsRef.current;
      lastTsRef.current = now;

      if (level > threshold) {
        aboveThresholdMsRef.current += dt;
      } else if (level < threshold * 0.6) {
        // tiny noise doesn't keep accumulating
        aboveThresholdMsRef.current = 0;
      }

      // console.log('mic level', level.toFixed(2), 'acc', Math.round(aboveThresholdMsRef.current));

      if (aboveThresholdMsRef.current >= neededMs) {
        console.log('blow detected via mic');
        doBlowOut();
        return;
      }

      requestAnimationFrame(check);
    };

    const id = requestAnimationFrame(check);
    return () => {
      running = false;
      cancelAnimationFrame(id);
    };
  }, [micEnabled, level]);

  // MediaPipe + camera; recreate cleanly on each mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
        );
        if (cancelled) return;

        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
          },
          numHands: 1,
          runningMode: 'VIDEO'
        });
        if (cancelled) return;
        handLandmarkerRef.current = landmarker;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        streamRef.current = stream;
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        const loop = () => {
          if (cancelled || !videoRef.current || !handLandmarkerRef.current) {
            return;
          }

          const results = handLandmarkerRef.current.detectForVideo(
            videoRef.current,
            performance.now()
          );

          if (results.landmarks && results.landmarks.length > 0) {
            const hand = results.landmarks[0];

            // index fingertip
            const tip = hand[8];
            if (tip) {
              setMatchPos({
                x: 1 - tip.x, // flip horizontally for selfie feel
                y: tip.y
              });
            }

            if (step === 'intro') {
              const inCandleArea = hand.some((p) => {
                const x = p.x;
                const y = p.y;
                const inX = x > 0.45 && x < 0.8
                const inY = y > 0.25 && y < 0.55;
                return inX && inY;
              });

              if (inCandleArea) {
                console.log('hand in candle area → light');
                setCakeLitState(true);
                setStep('blow');
              }
            }
          }

          animationFrameRef.current = requestAnimationFrame(loop);
        };

        animationFrameRef.current = requestAnimationFrame(loop);
      } catch (e) {
        console.error('MediaPipe init error', e);
      }
    }

    init();

    return () => {
      cancelled = true;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      handLandmarkerRef.current = null;
    };
  }, []); // fresh per mount

  // years + label
  const startDate = armyDate ? new Date(armyDate) : null;
  const now = new Date();
  let yearsAsArmy = 0;
  if (startDate && !isNaN(startDate.getTime())) {
    yearsAsArmy = now.getFullYear() - startDate.getFullYear();
    const beforeAnnivThisYear =
      now.getMonth() < startDate.getMonth() ||
      (now.getMonth() === startDate.getMonth() &&
        now.getDate() < startDate.getDate());
    if (beforeAnnivThisYear) yearsAsArmy -= 1;
    if (yearsAsArmy < 0) yearsAsArmy = 0;
  }

  function ordinal(n) {
    const v = n % 100;
    if (v >= 11 && v <= 13) return `${n}th`;
    switch (n % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  }

  const armyversaryLabel =
    yearsAsArmy > 0 ? `${ordinal(yearsAsArmy)} ARMYversary` : 'ARMYversary';

  return (
    <div
      className="armyversary-room"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundImage: `url(${cakeBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center bottom',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000
      }}
    >
      {step === 'done' && (
        <button
          className="back-button"
          onClick={onBack}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            zIndex: 2001
          }}
        >
          ← Back to main page
        </button>
      )}

      <div
        style={{
          textAlign: 'center',
          padding: '1.5rem 2rem',
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.85)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          maxWidth: '420px',
          marginBottom: '2rem'
        }}
      >
        <h2 style={{ color: '#9370db', marginBottom: '0.75rem' }}>
          🎂 Happy {armyversaryLabel}
          {currentUser?.displayName ? `, ${currentUser.displayName}` : ''}!
        </h2>

        {step === 'intro' && (
          <p style={{ color: '#555', fontSize: '0.95rem' }}>
            Use your hand to light the candles on your ARMY cake.
          </p>
        )}
        {step === 'blow' && (
          <p style={{ color: '#555', fontSize: '0.95rem' }}>
            Now blow out the candles to make a wish. (mic level: {level.toFixed(2)})
          </p>
        )}
        {step === 'done' && (
          <p style={{ color: '#555', fontSize: '0.95rem' }}>
            Wishing you another year of BTS, comfort, and tiny happiest moments. 💜
          </p>
        )}
      </div>

      <div
        style={{
          position: 'relative',
          width: '260px',
          height: '260px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <img
          src={cakeLitState ? cakeLit : cakeUnlit}
          alt="ARMYversary cake"
          style={{
            width: '220px',
            height: 'auto',
            imageRendering: 'pixelated'
          }}
        />

        {step === 'intro' && (
          <img
            src={matchImg}
            alt="Match"
            style={{
              position: 'absolute',
              width: '60px',
              opacity: 0.9,
              left: `${matchPos.x * 100}%`,
              top: `${matchPos.y * 100}%`,
              transform: 'translate(-50%, -50%) rotate(-20deg)',
              transformOrigin: 'center'
            }}
          />
        )}
      </div>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          position: 'fixed',
          bottom: '16px',
          right: '16px',
          width: '180px',
          height: 'auto',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          zIndex: 2100
        }}
      />

      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
        {step === 'intro' && (
          <button className="back-button" onClick={simulateHandLight}>
            Light candles
          </button>
        )}
        {step === 'blow' && (
          <button className="back-button" onClick={simulateBlowOut}>
            Blow out candles
          </button>
        )}
      </div>
      <canvas
  ref={confettiCanvasRef}
  style={{
    position: 'fixed',
    inset: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: 3000
  }}
/>

    </div>
  );
}


export default App;

