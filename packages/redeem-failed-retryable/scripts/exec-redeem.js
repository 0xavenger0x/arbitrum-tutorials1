const { providers, Wallet } = require('ethers')
const { L1TransactionReceipt, L1ToL2MessageStatus, L1ToL2Message, getL2Network } = require('@arbitrum/sdk')
const { arbLog, requireEnvVariables } = require('arb-shared-dependencies')
require('dotenv').config()
requireEnvVariables(['DEVNET_PRIVKEY', 'L2RPC', 'L1RPC'])

/**
 * Set up: instantiate the L2 wallet connected to provider
 */

const walletPrivateKey = process.env.DEVNET_PRIVKEY

const l1Provider = new providers.JsonRpcProvider(process.env.L1RPC)
const l2Provider = new providers.JsonRpcProvider(process.env.L2RPC)
const l2Wallet = new Wallet(walletPrivateKey, l2Provider)

module.exports = async txnHash => {

  await arbLog('Redeem A Failed Retryable Ticket')

  /**
   / * We start with an L1 txn hash; this is transaction that triggers craeting a retryable ticket
  */
  if (!txnHash)
    throw new Error(
     'Provide a transaction hash of an L1 transaction'
    )
  if (!txnHash.startsWith('0x') || txnHash.trim().length != 66)
   throw new Error(`Hmm, ${txnHash} doesn't look like a txn hash...`)

  /**
   * First, we check if our L1 to L2 message is redeemed on L2
  */
  const receipt = await l1Provider.getTransactionReceipt(txnHash)
  const l1Receipt = new L1TransactionReceipt(receipt)

  
  const message = await l1Receipt.getL1ToL2Message(l2Wallet)
  const status = (await message.waitForStatus()).status
  const autoRedeemHash = message.autoRedeemId
  const autoRedeemRec = await l2Provider.getTransactionReceipt(autoRedeemHash)

  switch(status)
  {
    case L1ToL2MessageStatus.REDEEMED: 
      console.log(`L2 retryable txn is already executed 🥳 ${message.l2TxHash}`)
    case L1ToL2MessageStatus.NOT_YET_CREATED:
      console.log(`The retryable ticket has yet to be created`)
    case L1ToL2MessageStatus.CREATION_FAILED:
      console.log(`An attempt was made to create the retryable ticket, but it failed. This could be due to not enough submission cost being paid by the L1 transaction`)
    case L1ToL2MessageStatus.FUNDS_DEPOSITED_ON_L2:
      console.log(`The retryable ticket has been created but has not been redeemed. This could be due to the auto redeem failing, you can redeem it now:`)
    case L1ToL2MessageStatus.EXPIRED:
      console.log(`The message has either expired or has been canceled. It can no longer be redeemed.`)
      
  }
  
  

  // switch(autoRedeemRec.status)
  // {
  //   case 1: 
  //     console.log(`Your auto redeem reverted.`)
  //   case 2:
  //     console.log(`Auto redeem failed; hit congestion in the chain; you can redeem it now:`)
  //   case 8:
  //     console.log(`auto redeem _TxResultCode_exceededTxGasLimit; you can redeem it now:`)
  //   case 10:
  //     console.log(`auto redeem TxResultCode_belowMinimumTxGas; you can redeem it now:`)
  //   case 11:
  //     console.log(`auto redeem TxResultCode_gasPriceTooLow; you can redeem it now:`)
  //   case 12:
  //     console.log(`auto redeem TxResultCode_noGasForAutoRedeem; you can redeem it now:`)  
  //   default:
  //     console.log(`auto redeem reverted; you can redeem it now:`)  
  // }

  // const status = await message.waitForStatus()

  // if(status === L1ToL2MessageStatus.REDEEMED) {
  //   console.log(`L2 retryable txn is already executed 🥳 ${message.l2TxHash}`)
  //   } else {
  // console.log(`L2 retryable txn failed with status ${L1ToL2MessageStatus[status]}`)
  // }  
  // console.log(`Redeeming the ticket now 🥳 `)

  // /**
  //  * We use the redeem() method from Arbitrum SDK to manually redeem our ticket
  // */
  // await message.redeem()
  // console.log('The L2 side of your transaction is now execeuted 🥳 :', message.l2TxHash)
}