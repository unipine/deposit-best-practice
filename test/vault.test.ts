import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import { utils } from 'ethers';
import { ethers } from 'hardhat';
import { Vault, MockERC20 } from '../types';

describe('Vault', () => {
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;
  let user3: SignerWithAddress;

  let vault: Vault;
  let token: MockERC20;

  before(async () => {
    [user1, user2, user3] = await ethers.getSigners();

    const TokenFactory = await ethers.getContractFactory("MockERC20");
    token = <MockERC20>await TokenFactory.deploy();
    await token.deployed();

    await token.mint(user1.address, utils.parseUnits("10000"));
    await token.mint(user2.address, utils.parseUnits("10000"));
    await token.mint(user3.address, utils.parseUnits("10000"));
  })

  beforeEach(async () => {
    const VaultFactory = await ethers.getContractFactory("Vault");
    vault = <Vault>await VaultFactory.deploy();
    await vault.deployed();
  })

  describe("Deposit", () => {
    it("should revert if deposit amount is zero", async () => {
      await expect(
        vault.deposit(token.address, 0)
      ).to.be.revertedWith('invalid amount');
    })
    it("should emit Deposit event when success", async () => {
      const depositAmount = utils.parseUnits('100');
      const beforeBalance = await token.balanceOf(user1.address);
      await token.connect(user1).approve(vault.address, depositAmount);
      await expect(
        vault.deposit(token.address, depositAmount)
      ).to.emit(vault, "Deposit").withArgs(
        token.address,
        user1.address,
        depositAmount
      );
      expect(await vault.balanceOf(token.address, user1.address)).to.be.equal(depositAmount);

      const afterBalance = await token.balanceOf(user1.address);
      expect(beforeBalance.sub(afterBalance)).to.be.equal(depositAmount);
    })
  })
  describe("Withdraw", () => {
    beforeEach(async () => {
      const depositAmount = utils.parseUnits('100');
      await token.connect(user1).approve(vault.address, depositAmount);
      await vault.deposit(token.address, depositAmount);
    })
    it("should revert if withdraw amount is zero or greater than balance", async () => {
      await expect(
        vault.withdraw(token.address, 0)
      ).to.be.revertedWith('invalid amount');
      await expect(
        vault.withdraw(token.address, utils.parseUnits('200'))
      ).to.be.revertedWith('invalid amount');
    })
    it("should emit Withdraw event when success", async () => {
      const withdrawAmount = utils.parseUnits('50');
      const beforeBalance = await token.balanceOf(user1.address);

      await expect(
        vault.withdraw(token.address, withdrawAmount)
      ).to.emit(vault, "Withdraw").withArgs(
        token.address,
        user1.address,
        withdrawAmount
      );

      const afterBalance = await token.balanceOf(user1.address);
      expect(afterBalance.sub(beforeBalance)).to.be.equal(withdrawAmount);
    })
  })
  describe("Top Users", () => {
    it("should return top 2 users", async () => {
      const depositAmount = utils.parseUnits('100');
      await token.connect(user1).approve(vault.address, depositAmount);
      await vault.connect(user1).deposit(token.address, depositAmount);

      await token.connect(user2).approve(vault.address, depositAmount.mul(2));
      await vault.connect(user2).deposit(token.address, depositAmount.mul(2));

      await token.connect(user3).approve(vault.address, depositAmount.mul(3));
      await vault.connect(user3).deposit(token.address, depositAmount.mul(3));

      let topUsers = await vault.topUsers(token.address);
      expect(topUsers.top1User).to.be.equal(user3.address);
      expect(topUsers.top2User).to.be.equal(user2.address);

      await token.connect(user2).approve(vault.address, depositAmount.mul(2));
      await vault.connect(user2).deposit(token.address, depositAmount.mul(2));
      topUsers = await vault.topUsers(token.address);
      expect(topUsers.top1User).to.be.equal(user2.address);
      expect(topUsers.top2User).to.be.equal(user3.address);
    })
  })
});