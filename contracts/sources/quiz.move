module contracts::quiz;

use std::string;
use sui::balance::{Self, Balance};
use sui::coin::{Self, Coin};
use sui::event;
use sui::package;
use sui::table::{Self, Table};
use sui::url::{Self, Url};
use sui::vec_map::{Self, VecMap};

// ===== Structs =====

// One-Time Witness for initialization
public struct QUIZ has drop {}

// Struct to represent a quiz
public struct Quiz<phantom T> has key, store {
    id: UID,
    name: string::String,
    description: string::String,
    url: Url,
    balance: Balance<T>,
    reward_amount: u64, // Amount to reward users who pass the quiz
    passed_users: VecMap<address, bool>, // Track users who passed the quiz
    creator: address, // Track the creator of the quiz
}

// Struct to track users and their created quizzes
public struct QuizTracker has key {
    id: UID,
    // Maps user address to a list of quiz IDs they created
    user_quizzes: Table<address, vector<ID>>,
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

// ===== Initialization =====

fun init(witness: QUIZ, ctx: &mut TxContext) {
    // Create the QuizTracker object
    let tracker = QuizTracker {
        id: object::new(ctx),
        user_quizzes: table::new(ctx),
    };

    // Share the QuizTracker object so it can be accessed by the module functions
    transfer::share_object(tracker);

    // Commit the package
    package::claim_and_keep(witness, ctx);
}

// ===== Public view functions =====

// Function to get a user's created quizzes
public fun get_user_quizzes(tracker: &QuizTracker, user: address): vector<ID> {
    if (table::contains(&tracker.user_quizzes, user)) {
        *table::borrow(&tracker.user_quizzes, user)
    } else {
        vector[]
    }
}

// Function to check if a user has created any quizzes
public fun has_created_quizzes(tracker: &QuizTracker, user: address): bool {
    table::contains(&tracker.user_quizzes, user)
}

// Function to count how many quizzes a user has created
public fun count_user_quizzes(tracker: &QuizTracker, user: address): u64 {
    if (table::contains(&tracker.user_quizzes, user)) {
        vector::length(table::borrow(&tracker.user_quizzes, user))
    } else {
        0
    }
}

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

public fun creator<T>(quiz: &Quiz<T>): address {
    quiz.creator
}

// ===== Entrypoints =====

#[allow(lint(self_transfer))]
public fun mint_to_sender<T>(
    name: vector<u8>,
    description: vector<u8>,
    url: vector<u8>,
    payment: Coin<T>,
    reward_amount: u64,
    tracker: &mut QuizTracker,
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
        creator: sender,
    };

    // Get the quiz ID to record in the tracker
    let quiz_id = object::id(&quiz);

    // Record the user's quiz creation in the tracker
    if (!table::contains(&tracker.user_quizzes, sender)) {
        // First quiz for this user, create a new vector
        table::add(&mut tracker.user_quizzes, sender, vector[quiz_id]);
    } else {
        // User already has quizzes, add this one to their list
        let user_quiz_ids = table::borrow_mut(&mut tracker.user_quizzes, sender);
        vector::push_back(user_quiz_ids, quiz_id);
    };

    event::emit(QuizMinted<T> {
        object_id: quiz_id,
        creator: sender,
        name: quiz.name,
        amount: payment_value,
        reward_amount,
    });

    // Share the quiz object so that it's accessible to all users
    transfer::share_object(quiz);
}

public entry fun pass<T>(quiz: &mut Quiz<T>, ctx: &mut TxContext) {
    let user = tx_context::sender(ctx);

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
    ctx: &mut TxContext,
) {
    // Only allow the creator to update the description
    assert!(tx_context::sender(ctx) == quiz.creator, 1002);
    quiz.description = string::utf8(new_description)
}

#[allow(lint(self_transfer))]
public entry fun burn<T>(quiz: Quiz<T>, ctx: &mut TxContext) {
    let Quiz {
        id,
        name: _,
        description: _,
        url: _,
        balance,
        reward_amount: _,
        passed_users: _,
        creator: _,
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

    // Initialize the module
    test_scenario::next_tx(scenario, admin);
    {
        init(QUIZ {}, test_scenario::ctx(scenario));
    };

    // Mint a quiz
    let name = b"Test Quiz";
    let description = b"This is a test quiz";
    let url_bytes = b"https://example.com/test.png";
    let payment_amount = 1000; // Execute the mint_to_sender function
    let reward_amount = 100; // Define reward amount for test

    test_scenario::next_tx(scenario, admin);
    {
        // Get the tracker from shared storage
        let mut tracker = test_scenario::take_shared<QuizTracker>(scenario);

        // Create a test coin to use as payment
        let test_coin = coin::mint_for_testing<SUI>(payment_amount, test_scenario::ctx(scenario));

        mint_to_sender<SUI>(
            name,
            description,
            url_bytes,
            test_coin,
            reward_amount,
            &mut tracker,
            test_scenario::ctx(scenario),
        );

        // Verify the admin's quiz was recorded in the tracker
        assert!(has_created_quizzes(&tracker, admin), 0);
        assert!(count_user_quizzes(&tracker, admin) == 1, 0);

        // Return the tracker to shared storage
        test_scenario::return_shared(tracker);
    };

    // Verify the quiz was shared and is accessible
    test_scenario::next_tx(scenario, admin);
    {
        // Check if the quiz is accessible as a shared object
        let quiz = test_scenario::take_shared<Quiz<SUI>>(scenario); // Verify quiz properties
        assert!(std::string::as_bytes(name(&quiz)) == name, 0);
        assert!(std::string::as_bytes(description(&quiz)) == description, 1);
        // Verify the balance is correct
        assert!(balance::value(balance(&quiz)) == payment_amount, 2);
        // Verify the reward amount is correct
        assert!(reward_amount(&quiz) == 100, 3);
        // Verify the creator is correct
        assert!(creator(&quiz) == admin, 4);
        // We'll skip URL verification since url::inner_url() returns a type incompatible with vector<u8>

        // Return the quiz to the shared object pool
        test_scenario::return_shared(quiz);
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

    // Initialize the module
    test_scenario::next_tx(scenario, admin);
    {
        init(QUIZ {}, test_scenario::ctx(scenario));
    };

    // Mint a quiz
    let name = b"Test Quiz";
    let description = b"This is a test quiz";
    let url_bytes = b"https://example.com/test.png";
    let payment_amount = 1000;
    let reward_amount = 100;
    test_scenario::next_tx(scenario, admin);
    {
        // Get the tracker from shared storage
        let mut tracker = test_scenario::take_shared<QuizTracker>(scenario);

        // Create a test coin to use as payment
        let test_coin = coin::mint_for_testing<SUI>(payment_amount, test_scenario::ctx(scenario));

        mint_to_sender<SUI>(
            name,
            description,
            url_bytes,
            test_coin,
            reward_amount,
            &mut tracker,
            test_scenario::ctx(scenario),
        );

        // Return the tracker to shared storage
        test_scenario::return_shared(tracker);
    };

    // User passes the quiz
    test_scenario::next_tx(scenario, user);
    {
        let mut quiz = test_scenario::take_shared<Quiz<SUI>>(scenario);

        // Initially, user shouldn't have passed the quiz
        assert!(!has_passed(&quiz, user), 1);

        // User passes the quiz
        pass<SUI>(&mut quiz, test_scenario::ctx(scenario));

        // Verify user has passed
        assert!(has_passed(&quiz, user), 2);

        // Verify balance decreased
        assert!(balance::value(balance(&quiz)) == payment_amount - reward_amount, 3);

        // Return the quiz
        test_scenario::return_shared(quiz);
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
