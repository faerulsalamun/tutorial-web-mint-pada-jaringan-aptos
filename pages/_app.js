import '../styles/globals.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  MartianWalletAdapter,
  WalletProvider
} from '@manahippo/aptos-wallet-adapter';
import { useMemo } from 'react';

function MyApp({ Component, pageProps }) {
  const wallets = useMemo(
    () => [
      new MartianWalletAdapter()
    ],
    []
  )

  return (
    <WalletProvider
      wallets={wallets}
      onError={(error) => {
        console.log('wallet errors',error);
        message.error(error.message);
      }}>
        <Component {...pageProps} />
      </WalletProvider>
  )
}

export default MyApp
