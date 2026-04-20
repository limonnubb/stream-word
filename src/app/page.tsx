'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useGameStore } from '@/store/gameStore'
import { WORDS, CAT_LABELS } from '@/data/words'

type View = 'game' | 'leaderboard' | 'profile'

const CATEGORIES = Object.keys(WORDS)

export default function Home() {
  const [view, setView] = useState<View>('game')
  const [category, setCategory] = useState('general')
  const [chatMessage, setChatMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<{ user: string; message: string; isCorrect?: boolean; isSystem?: boolean }[]>([])
  const [showWinner, setShowWinner] = useState(false)
  const [timer, setTimer] = useState(60)
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'info' | 'error' }[]>([])
  const [showConfetti, setShowConfetti] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [usernameInput, setUsernameInput] = useState('')
  const [activeTab, setActiveTab] = useState<'chat' | 'leaderboard'>('chat')
  
  const store = useGameStore()
  const { currentWord, guessed, round, leaderboard, sound, isPlaying, usedWords } = store
  
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isPlaying && timer > 0) {
      timerRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            handleTimeout()
            return 60
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isPlaying])

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [chatMessages])

  const handleTimeout = () => {
    if (!showWinner && currentWord) {
      addSystemMessage('Время вышло! Слово не угадано')
      store.skipWord()
    }
  }

  const addSystemMessage = (message: string) => {
    setChatMessages(prev => [...prev.slice(-50), { user: 'Система', message, isSystem: true }])
  }

  const generateWord = () => {
    setTimer(60)
    setShowWinner(false)
    store.currentCategory = category
    store.generateWord()
    setChatMessages([])
    addSystemMessage(`Новое слово в категории "${CAT_LABELS[category]}"`)
  }

  const handleWinner = (winnerName: string) => {
    if (showWinner || !currentWord) return
    
    setShowWinner(true)
    setTimer(60)
    store.setWinner(winnerName)
    
    const newMsgs = [
      ...chatMessages.slice(-50),
      { user: winnerName, message: currentWord, isCorrect: true }
    ]
    setChatMessages(newMsgs)
    setToasts(prev => [...prev, { id: Date.now(), message: `Победитель: ${winnerName}`, type: 'success' }])
    
    if (sound) {
      playWinSound()
    }
    
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)
  }

  const playWinSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const now = audioCtx.currentTime
      ;[523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, now + i * 0.11)
        gain.gain.setValueAtTime(0.1, now + i * 0.11)
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.11 + 0.4)
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.start(now + i * 0.11)
        osc.stop(now + i * 0.11 + 0.5)
      })
    } catch (e) {}
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return
    
    const mockUser = ['xXDarkSlayerXx', 'КотикМяу', 'ProGamer228', 'Luna_Star', 'NightWolf'][Math.floor(Math.random() * 5)]
    
    if (chatMessage.toLowerCase().trim() === currentWord.toLowerCase() && isPlaying && !showWinner) {
      handleWinner(mockUser)
    } else {
      setChatMessages(prev => [...prev.slice(-50), { user: mockUser, message: chatMessage }])
    }
    setChatMessage('')
  }

  const handleSkip = () => {
    store.skipWord()
    setShowWinner(false)
    addSystemMessage('Слово пропущено')
  }

  const handleLogin = () => {
    if (usernameInput.trim().length >= 2) {
      store.setUsername(usernameInput.trim())
      addSystemMessage(`Добро пожаловать, ${usernameInput}!`)
    }
  }

  const handleLogout = () => {
    store.setUsername('')
    setShowProfile(false)
  }

  const handleCategoryChange = (cat: string) => {
    setCategory(cat)
    store.currentCategory = cat
  }

  const handleSoundToggle = () => {
    store.toggleSound()
  }

  const timerProgress = ((60 - timer) / 60) * 201.06

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Background FX */}
      <div className="bg-blob">
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="bg-grid"></div>

      {/* Confetti */}
      {showConfetti && (
        <canvas className="confetti" id="confettiCanvas" />
      )}

      {/* Toasts */}
      <div className="toasts">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              className={`toast ${toast.type}`}
            >
              <i className={`fas fa-${toast.type === 'success' ? 'check-circle' : toast.type === 'info' ? 'info-circle' : 'exclamation-circle'}`}></i>
              {toast.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Header */}
      <header>
        <a href="#" className="logo">
          <div className="logo-icon"><i className="fas fa-bolt"></i></div>
          <em>StreamWord</em>
        </a>
        <nav>
          <button className={`nav-btn ${view === 'game' ? 'active' : ''}`} onClick={() => setView('game')}><i className="fas fa-gamepad"></i> Игра</button>
          <button className={`nav-btn ${view === 'leaderboard' ? 'active' : ''}`} onClick={() => setView('leaderboard')}><i className="fas fa-trophy"></i> Рейтинг</button>
        </nav>
        <div className="hdr-right">
          <div className="tw-status"><span className="dot"></span>Twitch Online</div>
          <button className="icon-btn" onClick={handleSoundToggle} aria-label="Звук">
            <i className={`fas fa-volume-${sound ? 'up' : 'mute'}`}></i>
          </button>
          <button className="icon-btn" onClick={() => setShowProfile(true)} aria-label="Профиль">
            <i className="fas fa-user"></i>
          </button>
        </div>
      </header>

      {/* Main Game */}
      <main className="app">
        <section className="game-col">
          {/* Categories */}
          <div className="cats">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cat ${category === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
              >
                {CAT_LABELS[cat]}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className="gstats">
            <div className="gs-item">
              <div className="gs-val">{round}</div>
              <div className="gs-lbl">Раунд</div>
            </div>
            <div className="gs-item">
              <div className="gs-val">{guessed}</div>
              <div className="gs-lbl">Угадано</div>
            </div>
            <div className="gs-item">
              <div className="gs-val">{store.totalPlayed > 0 ? Math.round((store.totalGuessed / store.totalPlayed) * 100) : 0}%</div>
              <div className="gs-lbl">Успех</div>
            </div>
          </div>

          {/* Word Area */}
          <div className="word-area">
            {!currentWord ? (
              <button className="gen-btn" onClick={generateWord}>
                <i className="fas fa-dice" style={{ marginRight: 8 }}></i>
                Сгенерировать слово
              </button>
            ) : (
              <>
                <div className={`wcard ${isPlaying ? 'visible' : ''}`}>
                  <div className="wcard-glow"></div>
                  <div className="wcard-cat">{CAT_LABELS[category]}</div>
                  <div className="wcard-word">{currentWord}</div>
                  
                  <div className="timer-wrap">
                    <svg className="timer-svg" viewBox="0 0 76 76">
                      <circle className="t-bg" cx="38" cy="38" r="32" />
                      <circle 
                        className={`t-prog ${timer <= 10 ? 'warn' : ''}`} 
                        cx="38" cy="38" r="32" 
                        strokeDasharray="201.06" 
                        strokeDashoffset={timerProgress}
                      />
                    </svg>
                    <div className="t-txt">{timer}</div>
                  </div>
                  
                  <div className="sbar">
                    <span className={`s-dot ${showWinner ? 'won' : ''}`}></span>
                    <span>{showWinner ? `Победил(а)!` : 'Ожидание ответа из чата'}</span>
                  </div>
                </div>

                {showWinner && (
                  <div className="wban visible">
                    <div className="wban-av"><i className="fas fa-crown"></i></div>
                    <div className="wban-info">
                      <div className="wban-lbl">Победитель</div>
                      <div className="wban-name">{chatMessages.find(m => m.isCorrect)?.user || 'Игрок'}</div>
                      <div className="wban-time">за {60 - timer} сек.</div>
                    </div>
                  </div>
                )}

                <div className="gctrls" style={{ display: 'flex' }}>
                  <button className="cbtn primary" onClick={generateWord}>
                    <i className="fas fa-arrow-right"></i> Дальше
                  </button>
                  <button className="cbtn" onClick={handleSkip}>
                    <i className="fas fa-forward"></i> Пропустить
                  </button>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Chat */}
        <aside className={`chat ${view === 'game' ? '' : 'open'}`}>
          <div className="chat-hdr">
            <h3><i className="fab fa-twitch"></i> Чат</h3>
            <span className="chat-viewers">{chatMessages.length + 142} зрителя</span>
          </div>
          <div className="chat-tabs">
            <button className={`cht ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>Чат</button>
            <button className={`cht ${activeTab === 'leaderboard' ? 'active' : ''}`} onClick={() => setActiveTab('leaderboard')}>Рейтинг</button>
          </div>
          
          {activeTab === 'chat' ? (
            <>
              <div className="chat-msgs" ref={chatRef}>
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`cmsg ${msg.isCorrect ? 'correct' : ''} ${msg.isSystem ? 'system' : ''}`}>
                    {msg.isSystem ? (
                      <span>{msg.message}</span>
                    ) : (
                      <>
                        <span className="un">{msg.user}</span>
                        <span>{msg.message}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <form className="chat-inp" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Написать в чат..."
                />
              </form>
            </>
          ) : (
            <div className="lb-list visible">
              {leaderboard.map((entry, i) => (
                <div key={i} className={`lb-item ${i === 0 ? 'top1' : i === 1 ? 'top2' : i === 2 ? 'top3' : ''}`}>
                  <div className="lb-rank">{i + 1}</div>
                  <div className="lb-av"><i className="fas fa-user"></i></div>
                  <div className="lb-name">{entry.name}</div>
                  <div className="lb-score">{entry.score}</div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </main>

      {/* Mobile Chat Button */}
      <button className="mob-chat" onClick={() => setView(view === 'game' ? 'chat' : 'game')}>
        <i className="fas fa-comments"></i>
      </button>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfile && (
          <motion.div 
            className="overlay visible" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={() => setShowProfile(false)}
          >
            <motion.div 
              className="modal" 
              initial={{ scale: 0.88, translateY: 20 }} 
              animate={{ scale: 1, translateY: 0 }} 
              exit={{ scale: 0.88, translateY: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mod-hdr">
                <h2>Профиль</h2>
                <button className="mod-close" onClick={() => setShowProfile(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="mod-body">
                {!store.username ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      placeholder="Ваше имя"
                      className="input"
                      style={{ width: '100%', padding: '0.75rem 1rem', background: '#121222', border: '1px solid #1e1e3a', borderRadius: '8px', color: '#eeeef5' }}
                    />
                    <button onClick={handleLogin} className="cbtn primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Войти
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="p-hero">
                      <div className="p-av"><i className="fas fa-user-astronaut"></i></div>
                      <div className="p-info">
                        <h3>{store.username}</h3>
                        <div className="tw-badge"><i className="fab fa-twitch"></i> Twitch</div>
                        <div className="joined">На платформе с {new Date().toLocaleDateString('ru')}</div>
                      </div>
                    </div>
                    <div className="p-stats">
                      <div className="p-st"><div className="v">{store.totalPlayed}</div><div className="l">Сыграно</div></div>
                      <div className="p-st"><div className="v">{store.totalGuessed}</div><div className="l">Угадано</div></div>
                      <div className="p-st"><div className="v">{store.totalPlayed > 0 ? Math.round((store.totalGuessed / store.totalPlayed) * 100) : 0}%</div><div className="l">Успех</div></div>
                    </div>
                    <button className="logout" onClick={handleLogout}>
                      <i className="fas fa-sign-out-alt"></i> Сменить аккаунт
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}