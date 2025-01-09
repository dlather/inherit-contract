import {
    time,
    loadFixture,
  } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
  import { expect } from "chai";
  import hre from "hardhat";
  import { getAddress, parseGwei } from "viem";

  const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  const ONE_MONTH_IN_SECONDS = 30 * 24 * 60 * 60;
  const INITIAL_BALANCE = 100n;
  
  describe("InheritContract", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use InheritContract to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    async function deployInheritContractFixture() {
      const [owner, heir, newHeir] = await hre.viem.getWalletClients();
      const inheritContract = await hre.viem.deployContract("InheritContract", [heir.account.address], {
        value: INITIAL_BALANCE,
      });
      const publicClient = await hre.viem.getPublicClient();

      return {
        inheritContract,
        heir,
        newHeir,
        owner,
        publicClient,
      };
    }
  
    describe("Deployment", function () {
        describe("Validations", function(){
            it("Should fail if the heir is the zero address", async function () {
                await expect(
                  hre.viem.deployContract("InheritContract", [ZERO_ADDRESS])
                ).to.be.rejectedWith("HeirCannotBeZeroAddress");
              });
        })
        
        describe("Setters", function(){
            it("Should set the right heir", async function () {
                const { inheritContract, heir } = await loadFixture(deployInheritContractFixture);
          
                expect(await inheritContract.read.heir()).to.equal(getAddress(heir.account.address));
              });
          
              it("Should set the right owner", async function () {
                const { inheritContract, owner } = await loadFixture(deployInheritContractFixture);
          
                expect(await inheritContract.read.owner()).to.equal(
                  getAddress(owner.account.address)
                );
              });

              it("Should lastWithdrawalTimeStamp be set to the current block timestamp", async function () {
                const { inheritContract } = await loadFixture(deployInheritContractFixture);
                const currentTimestamp = await time.latest();
                expect(await inheritContract.read.lastWithdrawalTimeStamp()).to.equal(BigInt(currentTimestamp));
              });
        })

        describe("Events", function(){
            it("Should emit an event on ownership transfer", async function () {
        const { inheritContract, owner } =
          await loadFixture(deployInheritContractFixture);

        // get the ownership transferred events in the latest block
        const ownershipTransferredEvents = await inheritContract.getEvents.OwnershipTransferred();
        expect(ownershipTransferredEvents).to.have.lengthOf(1);
        expect(ownershipTransferredEvents[0].args._previousOwner).to.equal(ZERO_ADDRESS);
        expect(ownershipTransferredEvents[0].args._newOwner).to.equal(getAddress(owner.account.address));
        });

        it("Should emit an event on heir update", async function () {
            const { inheritContract, heir } =
              await loadFixture(deployInheritContractFixture);
    
            // get the ownership transferred events in the latest block
            const heirUpdatedEvents = await inheritContract.getEvents.HeirUpdated();
            expect(heirUpdatedEvents).to.have.lengthOf(1);
            expect(heirUpdatedEvents[0].args._previousHeir).to.equal(ZERO_ADDRESS);
            expect(heirUpdatedEvents[0].args._newHeir).to.equal(getAddress(heir.account.address));
          });


    });
})

    describe("Withdraw", function () {
        describe("Validations", function(){

            it("Should not allow withdrawal if not the owner", async function () {
                const { inheritContract, heir } =
                  await loadFixture(deployInheritContractFixture);
    
                await expect(inheritContract.write.withdraw([1n], { account: heir.account.address })).to.be.rejectedWith("OnlyOwnerCanCall");
            });
    
            it("Should not allow withdrawal if not enough balance", async function () {
                const { inheritContract, publicClient } =
                  await loadFixture(deployInheritContractFixture);
    
                const contractBalance = await publicClient.getBalance({ address: getAddress(inheritContract.address) });
                const inValidWithdrawalAmount = contractBalance + 1n;
    
                await expect(inheritContract.write.withdraw([inValidWithdrawalAmount])).to.be.rejectedWith("NotEnoughBalance");
            });
        })

        describe("Withdrawal", function(){
            it("Should allow valid amount to be withdrawn", async function () {
                const { inheritContract, owner, publicClient } =
                  await loadFixture(deployInheritContractFixture);
    
                const contractBalance = await publicClient.getBalance({ address: getAddress(inheritContract.address) });
    
                const hash = await inheritContract.write.withdraw([contractBalance]);
                await publicClient.waitForTransactionReceipt({ hash });
    
                const withdrawalEvents = await inheritContract.getEvents.Withdrawal();
                expect(withdrawalEvents).to.have.lengthOf(1);
                expect(withdrawalEvents[0].args._amount).to.equal(contractBalance);
                expect(withdrawalEvents[0].args._by).to.equal(getAddress(owner.account.address));
            });
    
            it("Should allow 0 amount to be withdrawn", async function () {
                const { inheritContract, owner, publicClient } =
                  await loadFixture(deployInheritContractFixture);
    
                const hash = await inheritContract.write.withdraw([0n]);
                await publicClient.waitForTransactionReceipt({ hash });
    
                const withdrawalEvents = await inheritContract.getEvents.Withdrawal();
                expect(withdrawalEvents).to.have.lengthOf(1);
                expect(withdrawalEvents[0].args._amount).to.equal(0n);
                expect(withdrawalEvents[0].args._by).to.equal(getAddress(owner.account.address));
            });
    
            it("Should update the lastWithdrawalTimeStamp", async function () {
                const { inheritContract, publicClient } =
                  await loadFixture(deployInheritContractFixture);
    
                const hash = await inheritContract.write.withdraw([0n]);
                await publicClient.waitForTransactionReceipt({ hash });
    
                const lastWithdrawalTimeStamp = await inheritContract.read.lastWithdrawalTimeStamp();
                expect(lastWithdrawalTimeStamp).to.equal(BigInt(await time.latest()));
            });
        })

        describe("Events", function(){
            it("Should emit a Withdrawal event", async function () {
                const { inheritContract, owner, publicClient } =
                  await loadFixture(deployInheritContractFixture);

                const hash = await inheritContract.write.withdraw([0n]);
                await publicClient.waitForTransactionReceipt({ hash });

                const withdrawalEvents = await inheritContract.getEvents.Withdrawal();
                expect(withdrawalEvents).to.have.lengthOf(1);
                expect(withdrawalEvents[0].args._amount).to.equal(0n);
                expect(withdrawalEvents[0].args._by).to.equal(getAddress(owner.account.address));
            });
        })


    });

    describe("Heir", function () {
        describe("Validations", function(){
            it("Should not allow anyone to update the heir", async function () {
                const { inheritContract, heir } =
                  await loadFixture(deployInheritContractFixture);

                await expect(inheritContract.write.updateHeir([heir.account.address], { account: heir.account.address })).to.be.rejectedWith("OnlyOwnerCanCall");
            });

            it("Heir cannot be the zero address", async function () {
                const { inheritContract } =
                  await loadFixture(deployInheritContractFixture);

                await expect(inheritContract.write.updateHeir([ZERO_ADDRESS])).to.be.rejectedWith("HeirCannotBeZeroAddress");
            });
        })

        describe("Functionality", function(){
            it("Should allow heir to be updated", async function () {
                const { inheritContract, publicClient, heir, newHeir } =
                  await loadFixture(deployInheritContractFixture);

            const hash = await inheritContract.write.updateHeir([newHeir.account.address]);
            await publicClient.waitForTransactionReceipt({ hash });

            const newHeirAddress = await inheritContract.read.heir();
            expect(newHeirAddress).to.equal(getAddress(newHeir.account.address));

            const heirUpdatedEvents = await inheritContract.getEvents.HeirUpdated();
            expect(heirUpdatedEvents).to.have.lengthOf(1);
            expect(heirUpdatedEvents[0].args._previousHeir).to.equal(getAddress(heir.account.address));
                expect(heirUpdatedEvents[0].args._newHeir).to.equal(getAddress(newHeir.account.address));
            });
        })

        describe("Events", function(){
            it("Should emit a HeirUpdated event", async function () {
                const { inheritContract, heir, newHeir, publicClient } =
                  await loadFixture(deployInheritContractFixture);

                const hash = await inheritContract.write.updateHeir([newHeir.account.address]);
                await publicClient.waitForTransactionReceipt({ hash });

                const heirUpdatedEvents = await inheritContract.getEvents.HeirUpdated();
                expect(heirUpdatedEvents).to.have.lengthOf(1);
                expect(heirUpdatedEvents[0].args._previousHeir).to.equal(getAddress(heir.account.address));
                expect(heirUpdatedEvents[0].args._newHeir).to.equal(getAddress(newHeir.account.address));
            });
        })  

    }); 

    describe("Claim Ownership", function () {
        describe("Validations", function(){
            it("Should deny claim if not the heir", async function () {
                const { inheritContract, newHeir } =
                  await loadFixture(deployInheritContractFixture);
                  
                await expect(
                    inheritContract.write.claimOwnership([newHeir.account.address])
                ).to.be.rejectedWith("OnlyHeirCanCall");
            });
    
            it("Should deny claim if not enough time has passed", async function () {
                const { inheritContract, heir, newHeir } =
                  await loadFixture(deployInheritContractFixture);
    
                await expect(inheritContract.write.claimOwnership([newHeir.account.address], { account: heir.account.address })).to.be.rejectedWith("NotEnoughTimePassed");
            });
    
            it("Should not allow newHeir to be the zero address", async function () {
                const { inheritContract, heir } =
                  await loadFixture(deployInheritContractFixture);
    
                await time.increaseTo(await time.latest() + ONE_MONTH_IN_SECONDS);
                await expect(inheritContract.write.claimOwnership([ZERO_ADDRESS], { account: heir.account.address })).to.be.rejectedWith("HeirCannotBeZeroAddress");
            });
        })

        describe("Functionality", function(){
            it("Should allow claim if heir and enough time has passed", async function () {
                const { inheritContract, owner, publicClient, heir, newHeir } =
              await loadFixture(deployInheritContractFixture);

            await time.increaseTo(await time.latest() + ONE_MONTH_IN_SECONDS);

            const hash = await inheritContract.write.claimOwnership([newHeir.account.address], {
                account: heir.account.address
            });
            await publicClient.waitForTransactionReceipt({ hash });

            const ownerAddress = await inheritContract.read.owner();
            expect(ownerAddress).to.equal(getAddress(heir.account.address));
            const heirAddress = await inheritContract.read.heir();
            expect(heirAddress).to.equal(getAddress(newHeir.account.address));
            });
        })

        describe("Events", function(){
            it("Should emit a OwnershipTransferred event", async function () {
                const { inheritContract, owner, heir, newHeir, publicClient } =
                  await loadFixture(deployInheritContractFixture);

                await time.increaseTo(await time.latest() + ONE_MONTH_IN_SECONDS);

                const hash = await inheritContract.write.claimOwnership([newHeir.account.address], {
                    account: heir.account.address
                });
                await publicClient.waitForTransactionReceipt({ hash });

                const ownerUpdatedEvents = await inheritContract.getEvents.OwnershipTransferred();
                expect(ownerUpdatedEvents).to.have.lengthOf(1);
                expect(ownerUpdatedEvents[0].args._previousOwner).to.equal(getAddress(owner.account.address));
                expect(ownerUpdatedEvents[0].args._newOwner).to.equal(getAddress(heir.account.address));
            });

            it("Should emit a HeirUpdated event", async function () {
                const { inheritContract, heir, newHeir, publicClient } =
                  await loadFixture(deployInheritContractFixture);

                await time.increaseTo(await time.latest() + ONE_MONTH_IN_SECONDS);

                const hash = await inheritContract.write.claimOwnership([newHeir.account.address], {
                    account: heir.account.address
                });
                await publicClient.waitForTransactionReceipt({ hash });

                const heirUpdatedEvents = await inheritContract.getEvents.HeirUpdated();
                expect(heirUpdatedEvents).to.have.lengthOf(1);
                expect(heirUpdatedEvents[0].args._previousHeir).to.equal(getAddress(heir.account.address));
                expect(heirUpdatedEvents[0].args._newHeir).to.equal(getAddress(newHeir.account.address));
            });     
        })  
    });
  })