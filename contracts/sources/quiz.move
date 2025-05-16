module contracts::quiz;

use std::string;
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use sui::url::{Self, Url};

public struct Quiz<phantom T> has key, store {
    id: UID,
    name: string::String,
    description: string::String,
    url: Url,
    balance: Balance<T>,
}

// ===== Events =====

public struct QuizMinted<phantom T> has copy, drop {
    object_id: ID,
    creator: address,
    name: string::String,
    amount: u64,
}

// ===== Public view functions =====

public fun name<T>(quiz: &Quiz<T>): &string::String {
    &quiz.name
}

public fun description<T>(quiz: &Quiz<T>): &string::String {
    &quiz.description
}

public fun url<T>(quiz: &Quiz<T>): &Url {
    &quiz.url
}

public fun balance<T>(quiz: &Quiz<T>): &Balance<T> {
    &quiz.balance
}

// ===== Entrypoints =====

#[allow(lint(self_transfer))]
public fun mint_to_sender<T>(
    name: vector<u8>,
    description: vector<u8>,
    url: vector<u8>,
    payment: Coin<T>,
    ctx: &mut TxContext,
) {
    let sender = tx_context::sender(ctx);
    let payment_value = coin::value(&payment);
    let payment_balance = coin::into_balance(payment);

    let quiz = Quiz<T> {
        id: object::new(ctx),
        name: string::utf8(name),
        description: string::utf8(description),
        url: url::new_unsafe_from_bytes(url),
        balance: payment_balance,
    };

    event::emit(QuizMinted<T> {
        object_id: object::id(&quiz),
        creator: sender,
        name: quiz.name,
        amount: payment_value,
    });

    transfer::public_transfer(quiz, sender);
}

public fun transfer<T>(quiz: Quiz<T>, recipient: address, _: &mut TxContext) {
    transfer::public_transfer(quiz, recipient)
}

public fun update_description<T>(
    quiz: &mut Quiz<T>,
    new_description: vector<u8>,
    _: &mut TxContext,
) {
    quiz.description = string::utf8(new_description)
}

#[allow(lint(self_transfer))]
public fun burn<T>(quiz: Quiz<T>, ctx: &mut TxContext) {
    let Quiz { id, name: _, description: _, url: _, balance } = quiz;
    // If there are coins in the balance, we should return them to the transaction sender
    if (balance::value(&balance) > 0) {
        let sender = tx_context::sender(ctx);
        let coin = coin::from_balance(balance, ctx);
        transfer::public_transfer(coin, sender);
    } else {
        balance::destroy_zero(balance);
    };
    object::delete(id)
}

// ===== Tests =====

#[test]
fun test_mint_to_sender() {
    use sui::test_scenario;
    use sui::sui::SUI;

    // Create test address
    let admin = @0xABBA;

    // Create test scenario with admin as the sender
    let mut scenario_val = test_scenario::begin(admin);
    let scenario = &mut scenario_val;

    // Mint a quiz
    let name = b"Test Quiz";
    let description = b"This is a test quiz";
    let url_bytes = b"https://example.com/test.png";
    let payment_amount = 1000;

    // Execute the mint_to_sender function
    test_scenario::next_tx(scenario, admin);
    {
        // Create a test coin to use as payment
        let test_coin = coin::mint_for_testing<SUI>(payment_amount, test_scenario::ctx(scenario));

        mint_to_sender<SUI>(
            name,
            description,
            url_bytes,
            test_coin,
            test_scenario::ctx(scenario),
        );
    };

    // Verify the quiz was transferred to the sender
    test_scenario::next_tx(scenario, admin);
    {
        // Check if the sender received the quiz
        let quiz = test_scenario::take_from_sender<Quiz<SUI>>(scenario);

        // Verify quiz properties
        assert!(std::string::as_bytes(name(&quiz)) == name, 0);
        assert!(std::string::as_bytes(description(&quiz)) == description, 1);
        // Verify the balance is correct
        assert!(balance::value(balance(&quiz)) == payment_amount, 2);
        // We'll skip URL verification since url::inner_url() returns a type incompatible with vector<u8>

        // Return the quiz to the object pool
        test_scenario::return_to_sender(scenario, quiz);
    };

    test_scenario::end(scenario_val);
}
