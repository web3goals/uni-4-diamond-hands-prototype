module contracts::quiz;

use std::string;
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use sui::url::{Self, Url};
use sui::vec_map::{Self, VecMap};

public struct Quiz<phantom T> has key, store {
    id: UID,
    name: string::String,
    description: string::String,
    url: Url,
    balance: Balance<T>,
    reward_amount: u64, // Amount to reward users who pass the quiz
    passed_users: VecMap<address, bool>, // Track users who passed the quiz
}

// ===== Events =====

public struct QuizMinted<phantom T> has copy, drop {
    object_id: ID,
    creator: address,
    name: string::String,
    amount: u64,
    reward_amount: u64,
}

public struct QuizPassed<phantom T> has copy, drop {
    object_id: ID,
    user: address,
    reward_amount: u64,
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

public fun reward_amount<T>(quiz: &Quiz<T>): u64 {
    quiz.reward_amount
}

public fun has_passed<T>(quiz: &Quiz<T>, user: address): bool {
    vec_map::contains(&quiz.passed_users, &user)
}

// ===== Entrypoints =====

#[allow(lint(self_transfer))]
public fun mint_to_sender<T>(
    name: vector<u8>,
    description: vector<u8>,
    url: vector<u8>,
    payment: Coin<T>,
    reward_amount: u64,
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
        reward_amount,
        passed_users: vec_map::empty(),
    };

    event::emit(QuizMinted<T> {
        object_id: object::id(&quiz),
        creator: sender,
        name: quiz.name,
        amount: payment_value,
        reward_amount,
    });

    transfer::public_transfer(quiz, sender);
}

public fun pass<T>(quiz: &mut Quiz<T>, user: address, ctx: &mut TxContext) {
    // Check that this user hasn't already passed the quiz
    assert!(!vec_map::contains(&quiz.passed_users, &user), 1000);

    // Check that the quiz has enough balance to reward the user
    let reward = quiz.reward_amount;
    assert!(balance::value(&quiz.balance) >= reward, 1001);

    // Record that user passed the quiz
    vec_map::insert(&mut quiz.passed_users, user, true);

    // Send the reward to the user
    let reward_coin = coin::take(&mut quiz.balance, reward, ctx);
    transfer::public_transfer(reward_coin, user);

    // Emit event
    event::emit(QuizPassed<T> {
        object_id: object::id(quiz),
        user,
        reward_amount: reward,
    });
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
    let Quiz {
        id,
        name: _,
        description: _,
        url: _,
        balance,
        reward_amount: _,
        passed_users: _,
    } = quiz;

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
    let payment_amount = 1000; // Execute the mint_to_sender function
    test_scenario::next_tx(scenario, admin);
    {
        // Create a test coin to use as payment
        let test_coin = coin::mint_for_testing<SUI>(payment_amount, test_scenario::ctx(scenario));
        let reward_amount = 100; // Define reward amount for test

        mint_to_sender<SUI>(
            name,
            description,
            url_bytes,
            test_coin,
            reward_amount,
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
        // Verify the reward amount is correct
        assert!(reward_amount(&quiz) == 100, 3);
        // We'll skip URL verification since url::inner_url() returns a type incompatible with vector<u8>

        // Return the quiz to the object pool
        test_scenario::return_to_sender(scenario, quiz);
    };

    test_scenario::end(scenario_val);
}

#[test]
fun test_pass() {
    use sui::test_scenario;
    use sui::sui::SUI;

    // Create test addresses
    let admin = @0xABBA;
    let user = @0xBEEF;

    // Create test scenario
    let mut scenario_val = test_scenario::begin(admin);
    let scenario = &mut scenario_val;

    // Mint a quiz
    let name = b"Test Quiz";
    let description = b"This is a test quiz";
    let url_bytes = b"https://example.com/test.png";
    let payment_amount = 1000;
    let reward_amount = 100;

    test_scenario::next_tx(scenario, admin);
    {
        // Create a test coin to use as payment
        let test_coin = coin::mint_for_testing<SUI>(payment_amount, test_scenario::ctx(scenario));

        mint_to_sender<SUI>(
            name,
            description,
            url_bytes,
            test_coin,
            reward_amount,
            test_scenario::ctx(scenario),
        );
    }; // User passes the quiz
    test_scenario::next_tx(scenario, admin);
    {
        let mut quiz = test_scenario::take_from_sender<Quiz<SUI>>(scenario);

        // Initially, user shouldn't have passed the quiz
        assert!(!has_passed(&quiz, user), 1);

        // User passes the quiz
        pass<SUI>(&mut quiz, user, test_scenario::ctx(scenario));

        // Verify user has passed
        assert!(has_passed(&quiz, user), 2);

        // Verify balance decreased
        assert!(balance::value(balance(&quiz)) == payment_amount - reward_amount, 3);

        // Return the quiz
        test_scenario::return_to_sender(scenario, quiz);
    };

    // Verify user received the reward
    test_scenario::next_tx(scenario, user);
    {
        // Check if user received the reward coin
        let user_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
        assert!(coin::value(&user_coin) == reward_amount, 4);
        test_scenario::return_to_sender(scenario, user_coin);
    };

    test_scenario::end(scenario_val);
}
