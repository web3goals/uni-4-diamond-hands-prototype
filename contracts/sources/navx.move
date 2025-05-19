module contracts::navx;

use sui::coin::{Self, TreasuryCap};

// NAVX coin marker
public struct NAVX has drop {}

// Treasury cap wrapper to store in a shared object
public struct NAVXTreasury has key {
    id: UID,
    cap: TreasuryCap<NAVX>,
}

// Init function to create the NAVX coin and treasury
fun init(witness: NAVX, ctx: &mut TxContext) {
    let (treasury_cap, metadata) = coin::create_currency(
        witness,
        6,
        b"NAVX",
        b"",
        b"",
        option::none(),
        ctx,
    );
    transfer::public_freeze_object(metadata);

    // Create a shared treasury object that anyone can access
    let treasury = NAVXTreasury {
        id: object::new(ctx),
        cap: treasury_cap,
    };
    transfer::share_object(treasury);
}

// Public entry function that allows anyone to mint NAVX coins
public entry fun mint(treasury: &mut NAVXTreasury, amount: u64, ctx: &mut TxContext) {
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

    // Initialize the NAVX module
    {
        let ctx = test_scenario::ctx(scenario);
        init(NAVX {}, ctx);
    };

    // Test the mint function as a regular user
    test_scenario::next_tx(scenario, recipient);
    {
        // Get the shared treasury object
        let mut treasury = test_scenario::take_shared<NAVXTreasury>(scenario);
        let ctx = test_scenario::ctx(scenario);

        // Mint coins to the sender (recipient)
        mint(&mut treasury, 10_000_000, ctx);

        // Return the treasury to the shared object pool
        test_scenario::return_shared(treasury);
    };

    // Check that the recipient received the correct amount of NAVX
    test_scenario::next_tx(scenario, recipient);
    {
        // Get the coin from the recipient
        let coin = test_scenario::take_from_sender<Coin<NAVX>>(scenario);

        // Verify the amount (10 NAVX with 6 decimals)
        assert!(coin::value(&coin) == 10_000_000, 0);

        // Return the coin to the sender
        test_scenario::return_to_sender(scenario, coin);
    };

    test_scenario::end(scenario_val);
}
