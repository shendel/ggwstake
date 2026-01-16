const SignMessage = (options) => {
  const {
    activeWeb3,
    userAddress,
    signedData
  } = options
  return new Promise( async (resolve, reject) => {
    const messageHash = activeWeb3.utils.soliditySha3(...signedData)

    try {
      const signature = await activeWeb3.eth.personal.sign(messageHash, userAddress);
      resolve({
        userAddress,
        signedData,
        messageHash,
        signature
      })
    } catch (err) {
      reject(err)
    }
  })
}

export default SignMessage