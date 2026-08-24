type HeaderProps = {
  onHome: () => void
}

function Header({ onHome }: HeaderProps) {
  return (
    <header className="app-header">
      <button
        type="button"
        className="brand-button"
        onClick={onHome}
        aria-label="回到首頁"
      >
        <span className="brand-icon">AI</span>
        <span className="brand-name">
          AI Learning Coach
        </span>
      </button>

      <span className="module-label">
        Module 1 · 目標設定
      </span>
    </header>
  )
}

export default Header