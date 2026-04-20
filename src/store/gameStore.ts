import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WORDS } from '@/data/words'

type GameState = {
  username: string
  currentWord: string
  currentCategory: string
  isPlaying: boolean
  timerValue: number
  round: number
  guessed: number
  totalGuessed: number
  totalPlayed: number
  usedWords: string[]
  history: { word: string; winner: string; date: string }[]
  leaderboard: { name: string; score: number; wins: number }[]
  sound: boolean
  
  setUsername: (name: string) => void
  generateWord: () => void
  skipWord: () => void
  setWinner: (name: string) => void
  resetRound: () => void
  toggleSound: () => void
}

const getRandomItem = <T,>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)]
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      username: '',
      currentWord: '',
      currentCategory: 'general',
      isPlaying: false,
      timerValue: 60,
      round: 0,
      guessed: 0,
      totalGuessed: 0,
      totalPlayed: 0,
      usedWords: [],
      history: [],
      leaderboard: [
        { name: 'Luna_Star', score: 156, wins: 12 },
        { name: 'ProGamer228', score: 142, wins: 11 },
        { name: 'КотикМяу', score: 128, wins: 10 },
        { name: 'xXDarkSlayerXx', score: 115, wins: 9 },
        { name: 'NightWolf', score: 98, wins: 8 },
        { name: 'AstroNaut', score: 87, wins: 7 },
        { name: 'ChillVibes', score: 76, wins: 6 },
        { name: 'PixelKing', score: 65, wins: 5 },
        { name: 'CyberNinja', score: 54, wins: 4 },
        { name: 'IceBreaker', score: 43, wins: 3 }
      ],
      sound: true,

      setUsername: (name) => set({ username: name }),
      
      generateWord: () => {
        const state = get()
        const category = state.currentCategory
        const words = WORDS[category as keyof typeof WORDS] || WORDS.general
        
        let word = getRandomItem(words)
        if (state.usedWords.includes(word)) {
          word = getRandomItem(words)
        }
        
        set({
          currentWord: word,
          isPlaying: true,
          timerValue: 60,
          round: state.round + 1,
          guessed: 0,
          usedWords: [...state.usedWords, word]
        })
      },
      
      skipWord: () => {
        const state = get()
        set({
          isPlaying: false,
          totalPlayed: state.totalPlayed + 1,
          guessed: 0,
          timerValue: 60
        })
      },
      
      setWinner: (name) => {
        const state = get()
        if (!state.isPlaying) return
        
        const word = state.currentWord
        const newHistory = [
          { word, winner: name, date: new Date().toLocaleDateString('ru') },
          ...state.history
        ].slice(0, 10)
        
        const currentEntry = state.leaderboard.find(e => e.name === name)
        const currentScore = currentEntry ? currentEntry.score : 0
        const currentWins = currentEntry ? currentEntry.wins : 0
        
        const newLeaderboard = [
          ...state.leaderboard.filter(e => e.name !== name),
          { name, score: currentScore + 1, wins: currentWins + 1 }
        ].sort((a, b) => b.score - a.score).slice(0, 10)
        
        set({
          isPlaying: false,
          guessed: state.guessed + 1,
          totalGuessed: state.totalGuessed + 1,
          totalPlayed: state.totalPlayed + 1,
          history: newHistory,
          leaderboard: newLeaderboard,
          timerValue: 60
        })
      },
      
      resetRound: () => set({
        isPlaying: false,
        timerValue: 60,
        guessed: 0
      }),
      
      toggleSound: () => set({ sound: !get().sound })
    }),
    { name: 'stream-word-storage' }
  )
)