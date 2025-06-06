// module contracts::example;

// // Part 1: These imports are provided by default
// // use sui::object::{Self, UID};
// // use sui::transfer;
// // use sui::tx_context::{Self, TxContext};

// // Part 2: struct definitions
// public struct Sword has key, store {
//     id: UID,
//     magic: u64,
//     strength: u64,
// }

// public struct Forge has key {
//     id: UID,
//     swords_created: u64,
// }

// // Part 3: Module initializer to be executed when this module is published
// fun init(ctx: &mut TxContext) {
//     let admin = Forge {
//         id: object::new(ctx),
//         swords_created: 0,
//     };

//     // Transfer the forge object to the module/package publisher
//     transfer::transfer(admin, ctx.sender());
// }

// // Part 4: Accessors required to read the struct fields
// public fun magic(self: &Sword): u64 {
//     self.magic
// }

// public fun strength(self: &Sword): u64 {
//     self.strength
// }

// public fun swords_created(self: &Forge): u64 {
//     self.swords_created
// }

// // Part 5: Public/entry functions (introduced later in the tutorial)
// public fun sword_create(magic: u64, strength: u64, ctx: &mut TxContext): Sword {
//     Sword {
//         id: object::new(ctx),
//         magic: magic,
//         strength: strength,
//     }
// }

// // Part 6: Tests
// #[test]
// fun test_sword_create() {
//     // Create a dummy TxContext for testing
//     let mut ctx = tx_context::dummy();

//     // Create a sword
//     let sword = Sword {
//         id: object::new(&mut ctx),
//         magic: 42,
//         strength: 7,
//     };

//     // Check if accessor functions return correct values
//     assert!(sword.magic() == 42 && sword.strength() == 7, 1);

//     let dummy_address = @0xCAFE;
//     transfer::public_transfer(sword, dummy_address);
// }

// #[test]
// fun test_sword_transactions() {
//     use sui::test_scenario;

//     // Create test addresses representing users
//     let initial_owner = @0xCAFE;
//     let final_owner = @0xFACE;

//     // First transaction executed by initial owner to create the sword
//     let mut scenario = test_scenario::begin(initial_owner);
//     {
//         // Create the sword and transfer it to the initial owner
//         let sword = sword_create(42, 7, scenario.ctx());
//         transfer::public_transfer(sword, initial_owner);
//     };

//     // Second transaction executed by the initial sword owner
//     scenario.next_tx(initial_owner);
//     {
//         // Extract the sword owned by the initial owner
//         let sword = scenario.take_from_sender<Sword>();
//         // Transfer the sword to the final owner
//         transfer::public_transfer(sword, final_owner);
//     };

//     // Third transaction executed by the final sword owner
//     scenario.next_tx(final_owner);
//     {
//         // Extract the sword owned by the final owner
//         let sword = scenario.take_from_sender<Sword>();
//         // Verify that the sword has expected properties
//         assert!(sword.magic() == 42 && sword.strength() == 7, 1);
//         // Return the sword to the object pool (it cannot be simply "dropped")
//         scenario.return_to_sender(sword)
//     };
//     scenario.end();
// }
