require("dotenv").config()

const ContractData = require("./abi/GGWBurnManager.json")
const BigNumber = require("bignumber.js");
const server_port = process.env.SERVER_PORT
const server_ip = process.env.SERVER_IP

const cors = require("cors")
const express = require("express")
const app = express()

const { initWeb3, getActiveWallet } = require("./initWeb3")

const {
  http: activeWeb3Http,
  ws: activeWeb3WS
} = initWeb3()
const activeWallet = getActiveWallet()

const { addToStakePool } = require('./addToStakePool')
const { fetchSummary } = require('./fetchSummary')

app.use(cors())
app.use('/status', async(req, res) => {
})

const delay = (ms) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}
const getUnixTimeStamp = () => Math.floor(new Date().getTime() / 1000);


const checkNeedAddToStakePool = () => {
  return new Promise(async (resolve) => {
    try {
      const summary = await fetchSummary({
        activeWeb3: activeWeb3Http,
        contractAddress: process.env.CONTRACT
      })
      if (getUnixTimeStamp() > (Number(summary.lastToStakePoolDate) + Number(process.env.CHECK_INTERVAL))) {
        if (new BigNumber(summary.balance).isGreaterThan(0)) {
          console.log('Time to add tokens to stake pool: ', summary.balance)
          await addToStakePool({
            activeWeb3: activeWeb3Http,
            activeWallet,
            contractAddress: process.env.CONTRACT,
          })
        }
      }
      resolve()
    } catch (err) {
      console.log('>>> Fail fetch not filled')
      console.log(err)
      resolve()
    }
  })
}

const run = async () => {
  
  await checkNeedAddToStakePool()
  setInterval(async () => {
    await checkNeedAddToStakePool()
  }, 10000)
}

run()

app.listen(server_port, server_ip, () => {
  console.log(`Backend started at http://${server_ip}:${server_port}`);
});
