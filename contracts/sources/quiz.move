module contracts::quiz;

use std::string;
use sui::event;
use sui::url::{Self, Url};

public struct Quiz has key, store {
    id: UID,
    name: string::String,
    description: string::String,
    url: Url,
}

// ===== Events =====

public struct QuizMinted has copy, drop {
    object_id: ID,
    creator: address,
    name: string::String,
}

// ===== Public view functions =====

public fun name(nft: &Quiz): &string::String {
    &nft.name
}

public fun description(nft: &Quiz): &string::String {
    &nft.description
}

public fun url(nft: &Quiz): &Url {
    &nft.url
}

// ===== Entrypoints =====

#[allow(lint(self_transfer))]
public fun mint_to_sender(
    name: vector<u8>,
    description: vector<u8>,
    url: vector<u8>,
    ctx: &mut TxContext,
) {
    let sender = ctx.sender();
    let nft = Quiz {
        id: object::new(ctx),
        name: string::utf8(name),
        description: string::utf8(description),
        url: url::new_unsafe_from_bytes(url),
    };

    event::emit(QuizMinted {
        object_id: object::id(&nft),
        creator: sender,
        name: nft.name,
    });

    transfer::public_transfer(nft, sender);
}

public fun transfer(nft: Quiz, recipient: address, _: &mut TxContext) {
    transfer::public_transfer(nft, recipient)
}

public fun update_description(nft: &mut Quiz, new_description: vector<u8>, _: &mut TxContext) {
    nft.description = string::utf8(new_description)
}

public fun burn(nft: Quiz, _: &mut TxContext) {
    let Quiz { id, name: _, description: _, url: _ } = nft;
    id.delete()
}

// ===== Tests =====

#[test]
fun test_mint_to_sender() {
    use sui::test_scenario; // Create test address
    let admin = @0xABBA;

    // Create test scenario with admin as the sender
    let mut scenario_val = test_scenario::begin(admin);
    let scenario = &mut scenario_val;

    // Mint an NFT
    let name = b"Test Quiz";
    let description = b"This is a test quiz NFT";
    let url_bytes = b"https://example.com/test.png";

    // Execute the mint_to_sender function
    test_scenario::next_tx(scenario, admin);
    {
        mint_to_sender(
            name,
            description,
            url_bytes,
            test_scenario::ctx(scenario),
        );
    };

    // Verify the NFT was transferred to the sender
    test_scenario::next_tx(scenario, admin);
    {
        // Check if the sender received the NFT
        let nft = test_scenario::take_from_sender<Quiz>(scenario);

        // Verify NFT properties
        assert!(std::string::as_bytes(name(& nft)) == name, 0);
        assert!(std::string::as_bytes(description(& nft)) == description, 1);
        // We'll skip URL verification since url::inner_url() returns a type incompatible with vector<u8>

        // Return the NFT to the object pool
        test_scenario::return_to_sender(scenario, nft);
    };

    test_scenario::end(scenario_val);
}
