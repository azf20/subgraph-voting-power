import {
  createMockedFunction,
  clearStore,
  test,
  assert,
  logStore,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes, ethereum } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";
import { handleTransfer } from "../src/lgno";
import { Transfer } from "../generated/ds-lgno/LGNO";
import { log, newMockEvent } from "matchstick-as";
import { ADDRESS_ZERO } from "../src/helpers";

const user1 = "0x0000000000000000000000000000000000000001";
const user2 = "0x0000000000000000000000000000000000000002";
const value = BigInt.fromI32(1337);
const value2x = BigInt.fromI32(2674);
const data = "0x00";

export function createTransferEvent(
  from: string,
  to: string,
  value: BigInt,
  data: string
): Transfer {
  let mockEvent = newMockEvent();

  mockEvent.parameters = new Array();

  mockEvent.parameters.push(
    new ethereum.EventParam(
      "from",
      ethereum.Value.fromAddress(Address.fromString(from))
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam(
      "to",
      ethereum.Value.fromAddress(Address.fromString(to))
    )
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("value", ethereum.Value.fromSignedBigInt(value))
  );
  mockEvent.parameters.push(
    new ethereum.EventParam("data", ethereum.Value.fromString(data))
  );

  let newTransferEvent = new Transfer(
    mockEvent.address,
    mockEvent.logIndex,
    mockEvent.transactionLogIndex,
    mockEvent.logType,
    mockEvent.block,
    mockEvent.transaction,
    mockEvent.parameters
  );

  return newTransferEvent;
}

test("Transfer correctly increases lGNO balance of recipient", () => {
  // note: from and to are reversed due to an error in the implementation
  let transferEvent = createTransferEvent(user1, ADDRESS_ZERO, value, data);

  // mint 1337 to user 1
  handleTransfer(transferEvent);
  assert.fieldEquals("User", user1.toLowerCase(), "lgno", value.toString());

  // mint another 1337 to user 1, should have a total of 2674
  handleTransfer(transferEvent);
  assert.fieldEquals("User", user1.toLowerCase(), "lgno", value2x.toString());
  clearStore();
});

test("Transfer correctly decreases lGNO balance of sender", () => {
  // mint 2674 to user1
  let mintEvent = createTransferEvent(user1, ADDRESS_ZERO, value2x, data);
  handleTransfer(mintEvent);
  assert.fieldEquals("User", user1.toLowerCase(), "lgno", value2x.toString());

  // send 1337 from user1 to user2, user one should have 1337 left
  let transferEvent = createTransferEvent(user2, user1, value, data);
  handleTransfer(transferEvent);
  assert.fieldEquals("User", user1.toLowerCase(), "lgno", value.toString());

  clearStore();
});

// test("Transfer correctly increases vote weight of recipient", () => {
//   let transferEvent = createTransferEvent(user1, ADDRESS_ZERO, value, data);

//   // mint 1337 to user 1
//   handleTransfer(transferEvent);
//   assert.fieldEquals(
//     "User",
//     user1.toLowerCase(),
//     "voteWeight",
//     value.toString()
//   );

//   // mint another 1337 to user 1, should have a total of 2674
//   handleTransfer(transferEvent);
//   assert.fieldEquals(
//     "User",
//     user1.toLowerCase(),
//     "voteWeight",
//     value2x.toString()
//   );
//   clearStore();
// });

// test("Transfer correctly decreases vote weight of sender", () => {
//   // mint 2674 to user1
//   let mintEvent = createTransferEvent(user1, ADDRESS_ZERO, value2x, data);
//   handleTransfer(mintEvent);
//   assert.fieldEquals(
//     "User",
//     user1.toLowerCase(),
//     "voteWeight",
//     value2x.toString()
//   );

//   // send 1337 from user1 to user2, user one should have 1337 left
//   let transferEvent = createTransferEvent(user2, user1, value, data);
//   handleTransfer(transferEvent);
//   assert.fieldEquals(
//     "User",
//     user1.toLowerCase(),
//     "voteWeight",
//     value.toString()
//   );

//   clearStore();
// });

// test("Transfer resulting in 0 vote weight removes user from store.", () => {
//   // mint 2674 to user1
//   let mintEvent = createTransferEvent(ADDRESS_ZERO, user1, value, data);
//   handleTransfer(mintEvent);
//   assert.fieldEquals(
//     "User",
//     user1.toLowerCase(),
//     "voteWeight",
//     value.toString()
//   );

//   // send 1337 from user1 to user2, user one should have 0 left and be removed from store
//   let transferEvent = createTransferEvent(user1, user2, value, data);
//   handleTransfer(transferEvent);
//   assert.notInStore("User", user1.toLowerCase());

//   clearStore();
// });

// test("Transfer involving ADDRESS_ZERO does not create an ADDRESS_ZERO entity.", () => {
//   // mint 2674 to user1
//   let mintEvent = createTransferEvent(ADDRESS_ZERO, user1, value, data);
//   handleTransfer(mintEvent);
//   assert.notInStore("User", ADDRESS_ZERO);

//   // send 1337 from user1 to user2, user one should have 0 left and be removed from store
//   let transferEvent = createTransferEvent(user1, ADDRESS_ZERO, value, data);
//   handleTransfer(transferEvent);
//   assert.notInStore("User", ADDRESS_ZERO);

//   clearStore();
// });
