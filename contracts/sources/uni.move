module contracts::uni;

use sui::coin::{Self, TreasuryCap};

public struct UNI has drop {}

fun init(witness: UNI, ctx: &mut TxContext) {
    let (treasury, metadata) = coin::create_currency(
        witness,
        6,
        b"UNI",
        b"",
        b"",
        option::none(),
        ctx,
    );
    transfer::public_freeze_object(metadata);
    transfer::public_transfer(treasury, ctx.sender())
}

public fun mint(
    treasury_cap: &mut TreasuryCap<UNI>,
    amount: u64,
    recipient: address,
    ctx: &mut TxContext,
) {
    let coin = coin::mint(treasury_cap, amount, ctx);
    transfer::public_transfer(coin, recipient)
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

    // Check that the TreasuryCap was transferred to the admin and mint coins
    test_scenario::next_tx(scenario, admin);
    {
        // Get the TreasuryCap object
        let mut treasury_cap = test_scenario::take_from_sender<TreasuryCap<UNI>>(scenario);
        let ctx = test_scenario::ctx(scenario);

        // Mint coins to the recipient
        let amount = 100000000; // 100 UNI with 6 decimals
        mint(&mut treasury_cap, amount, recipient, ctx);

        // Return the TreasuryCap to the sender
        test_scenario::return_to_sender(scenario, treasury_cap);
    };

    // Check that the recipient received the correct amount of UNI
    test_scenario::next_tx(scenario, recipient);
    {
        // Get the coin from the recipient
        let coin = test_scenario::take_from_sender<Coin<UNI>>(scenario);

        // Verify the amount
        assert!(coin::value(&coin) == 100000000, 0);

        // Return the coin to the sender
        test_scenario::return_to_sender(scenario, coin);
    };

    test_scenario::end(scenario_val);
}
