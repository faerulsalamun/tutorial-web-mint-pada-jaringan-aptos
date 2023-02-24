import { useWallet, WalletSendTransactionError } from "@manahippo/aptos-wallet-adapter";
import { AptosClient } from "aptos";
import { useState } from "react";
import { Button, Container, Nav, Navbar, Row, Col } from "react-bootstrap";

const CANDY_MACHINE_ID = '0x32119ee4ce573566dcabb443b5c2022405e1638ad5afacccc2c32dfc1501c10c';
const SMART_CONTRACT_ADDRESS = '0x589db8bafed425239e1671313cabc182d23d2f952c1a512a0af81eae0085e293';
const NODE_URL = 'https://fullnode.testnet.aptoslabs.com';
const aptosClient = new AptosClient(NODE_URL);

export default function Home() {
  const [totalSupply,setTotalSupply] = useState(0);
  const [totalMinted,setTotalMinted] = useState(0);
  const [publicSaleMintPrice, setPublicSaleMintPrice] = useState(0);

  const {
    autoConnect,
    connect,
    disconnect,
    account,
    wallets,
    signAndSubmitTransaction,
    connecting,
    connected,
    disconnecting,
    wallet: currentWallet,
    signMessage,
    signTransaction
  } = useWallet();

  const connectButton = () => {
    return wallets.map((wallet) =>{
      const option = wallet.adapter;
      return (
        <Button
          onClick={() => {
            connect(option.name)
          }}
          key={option.name}
        >
          Connect To Wallet : {option.name}
        </Button>
      )
    })
  }

  const mint = async() => {
    if(account?.address || account?.publicKey) {
      const payload = {
        type : "entry_function_payload",
        function : `${SMART_CONTRACT_ADDRESS}::candymachine::mint_script`,
        type_arguments: [],
        arguments : [
          CANDY_MACHINE_ID
        ]
      };

      const transactionRes = await signAndSubmitTransaction(payload);
      await aptosClient.waitForTransaction(transactionRes?.hash || '');
      alert(`https://explorer.devnet.aptos.dev/txn/${transactionRes?.hash}`);
      await getDataCandyMachine();
    }
  }

  const getDataCandyMachine = async() => {
    const data = await aptosClient.getAccountResources(CANDY_MACHINE_ID);
    console.log(data)

    for (const resource of data) {
      if(resource.type === `${SMART_CONTRACT_ADDRESS}::candymachine::CandyMachine`){
        console.log(resource)
        setTotalSupply(resource.data.total_supply);
        setTotalMinted(resource.data.minted);
        setPublicSaleMintPrice(resource.data.public_sale_mint_price);
      }
    }
  }

  const content = () => {
    getDataCandyMachine()

    return (
      <>
        <div className="mb-2 text-center">Connected to address : { account?.address}</div>
        <div className="mb-2 text-center">Total : { totalMinted } / { totalSupply }</div>
        <div className="mb-2 text-center">Public Price : { publicSaleMintPrice/100000000 } Aptos</div>
        <Button
          onClick={mint}
        >
          Mint
        </Button>

      </>
    )
  }

  return (
    <>
      <Navbar bg='dark' variant='dark'>
        <Container>
          <Navbar.Brand href="#">Aptos</Navbar.Brand>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#">Home</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="h-100">
        <Row className='h-100 align-items-center justify-content-center'>
          <Col className='text-center'>
            { (connected && account) ? content() : connectButton() }
          </Col>
        </Row>
      </Container>
    </>
  )
}
