import { useWalletUI } from '@web3auth/modal/react'

function WalletUIButton() {
  const { showWalletUI, loading, error } = useWalletUI()

  return (
    <div>
      <button onClick={() => showWalletUI()} disabled={loading}>
        {loading ? 'Opening Wallet...' : 'Open Wallet'}
      </button>
      {error && <div>{error.message}</div>}
    </div>
  )
}

export default WalletUIButton;