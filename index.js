import { ethers } from "./ethers-6.7.esm.min.js"
import { abi, contractAddress, chainIdMap} from "./constants.js"

let currentAccount = null;

const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const ethAmountForm = document.getElementById("ethAmount")
const toggleThemeButton = document.getElementById('toggle-theme');

connectButton.onclick = connect
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

toggleThemeButton.addEventListener('click', () => {
  const body = document.body;
  if (body.classList.contains('dark-mode')) {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
  } else {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
  }
});

function updateButtons(status) {
  withdrawButton.disabled = status;
  fundButton.disabled = status;
  balanceButton.disabled = status;
  ethAmountForm.disabled = status;
}

function pressButton(button, status) {
  if(status){ // Status = true then button is pressed
    if(!button.classList.contains("pressed")){
      button.classList.add("pressed");
    }
  } else {
    if(button.classList.contains("pressed")){
      button.classList.remove("pressed");
    }
  }
}



updateButtons(true)
document.body.classList.add('light-mode');
connectButton.innerHTML = "Connect Wallet";

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    if(!currentAccount){
      try {
        await ethereum.request({ method: "eth_requestAccounts" })
      } catch (error) {
        console.log(error);
      }
      const accounts = await ethereum.request({ method: "eth_accounts" })
      currentAccount = accounts[0];
      var currentAccountAbbreviated = currentAccount.slice(0, 7) + "..." + currentAccount.slice(-5);
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      var networkName = chainIdMap[chainId];
      pressButton(connectButton, true);
      connectButton.innerHTML = `Connected: ${currentAccountAbbreviated} on ${networkName}`;
      updateButtons(false)
    } else {
      currentAccount = null;
      pressButton(connectButton, false);
      connectButton.innerHTML = "Connect Wallet";
      updateButtons(true)
    }
  } else {
    connectButton.innerHTML = "Please install MetaMask";
  }
}

async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      console.log("Processing transaction...")
      const transactionResponse = await contract.withdraw()
      await transactionResponse.wait(1)
      console.log("Done!")
    } catch (error) {
      console.log(error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.parseEther(ethAmount),
      })
      await transactionResponse.wait(1)
    } catch (error) {
      console.log(error)
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.BrowserProvider(window.ethereum)
    try {
      const balance = await provider.getBalance(contractAddress)
      console.log(ethers.formatEther(balance))
    } catch (error) {
      console.log(error)
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask"
  }
}
