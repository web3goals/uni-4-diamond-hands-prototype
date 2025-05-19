module contracts::uni;

use sui::coin::{Self, TreasuryCap};

// UNI coin marker
public struct UNI has drop {}

// Treasury cap wrapper to store in a shared object
public struct UNITreasury has key {
    id: UID,
    cap: TreasuryCap<UNI>,
}

// Init function to create the UNI coin and treasury
fun init(witness: UNI, ctx: &mut TxContext) {
    let (treasury_cap, metadata) = coin::create_currency(
        witness,
        6,
        b"UNI",
        b"",
        b"",
        option::none(),
        ctx,
    );
    transfer::public_freeze_object(metadata);

    // Create a shared treasury object that anyone can access
    let treasury = UNITreasury {
        id: object::new(ctx),
        cap: treasury_cap,
    };
    transfer::share_object(treasury);
}

// Public entry function that allows anyone to mint UNI coins
public entry fun mint(treasury: &mut UNITreasury, amount: u64, ctx: &mut TxContext) {
    let coin = coin::mint(&mut treasury.cap, amount, ctx);
    transfer::public_transfer(coin, tx_context::sender(ctx))
}

#[test]
fun test_mint() {
    use sui::test_scenario;
    use sui::coin::Coin;

    // Create a test scenario with a dummy address as sender
    let admin = @0xA;
    let recipient = @0xB;
    let mut scenario_val = test_scenario::begin(admin);
    let scenario = &mut scenario_val;

    // Initialize the UNI module
    {
        let ctx = test_scenario::ctx(scenario);
        init(UNI {}, ctx);
    };

    // Test the mint function as a regular user
    test_scenario::next_tx(scenario, recipient);
    {
        // Get the shared treasury object
        let mut treasury = test_scenario::take_shared<UNITreasury>(scenario);
        let ctx = test_scenario::ctx(scenario);

        // Mint coins to the sender (recipient)
        mint(&mut treasury, 10_000_000, ctx);

        // Return the treasury to the shared object pool
        test_scenario::return_shared(treasury);
    };

    // Check that the recipient received the correct amount of UNI
    test_scenario::next_tx(scenario, recipient);
    {
        // Get the coin from the recipient
        let coin = test_scenario::take_from_sender<Coin<UNI>>(scenario);

        // Verify the amount (10 UNI with 6 decimals)
        assert!(coin::value(&coin) == 10_000_000, 0);

        // Return the coin to the sender
        test_scenario::return_to_sender(scenario, coin);
    };

    test_scenario::end(scenario_val);
}
