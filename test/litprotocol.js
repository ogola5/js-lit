const { expect } = require('chai');
const hre = require("hardhat");
const { ethers } = require("hardhat");

describe('LitProtocol', function () {
  let litProtocol;
  let owner;

  beforeEach(async function () {
    litProtocol = await hre.ethers.deployContract('LitProtocol');
    [owner] = await ethers.getSigners();
    await litProtocol.waitForDeployment();
  });

  it('should register a user', async function () {
    const registerTx = await litProtocol.registerUser('user1', 'passwordHash');
    await registerTx.wait();

    expect(await litProtocol.isRegistered(owner.address)).to.be.true;
  });

  it('should setup MFA', async function () {
    await litProtocol.registerUser('user1', 'passwordHash');
    
    const publicKeyBytes = ethers.toBeHex('publicKey');
    const recoveryCode = 'recoveryCode';

    const mfaSetupTx = await litProtocol.setupMFA(publicKeyBytes, recoveryCode);
    await mfaSetupTx.wait();

    //ethers.AbiCoder.defaultAbiCoder().decode(["uint"], VARIABLE_NAME for the bytes variables
    const storedPublicKeyBytes = await litProtocol.getPublicKey(owner.address);
    const storedPublicKey = ethers.AbiCoder.defaultAbiCoder().decode(['bytes'], storedPublicKeyBytes)[0];
    expect(storedPublicKey).to.equal('publicKey');
  });

  it('should authenticate successfully', async function () {
    await litProtocol.registerUser('user1', 'passwordHash');
    await litProtocol.setupMFA('publicKey', 'recoveryCode');

    const authenticateResult = await litProtocol.authenticate('user1', 'passwordHash', 'otp');
    expect(authenticateResult).to.be.true;
  });

  it('should not authenticate with incorrect OTP', async function () {
    await litProtocol.registerUser('user1', 'passwordHash');
    await litProtocol.setupMFA('publicKey', 'recoveryCode');

    const authenticateResult = await litProtocol.authenticate('user1', 'passwordHash', 'incorrectOTP');
    expect(authenticateResult).to.be.false;
  });

  it('should recover account', async function () {
    await litProtocol.registerUser('user1', 'passwordHash');
    await litProtocol.setupMFA('publicKey', 'recoveryCode');

    const recoverTx = await litProtocol.recoverAccount('user1', 'recoveryCode');
    await recoverTx.wait();

    const newPublicKeyBytes = await litProtocol.getPublicKey(owner.address);
    const newPublicKey = ethers.AbiCoder.defaultAbiCoder().decode(['bytes'], newPublicKeyBytes)[0];
    expect(newPublicKey).to.equal('new-public-key')
  });
});