// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {SystrumStore} from "../contracts/SystrumStore.sol";

contract SystrumStoreTest is Test {
    SystrumStore internal store;

    address internal artist = makeAddr("artist");
    address internal label = makeAddr("label");
    address internal buyer = makeAddr("buyer");
    address internal reseller = makeAddr("reseller");

    bytes32 internal constant YKIDR = keccak256("ykidr-standard");

    function setUp() public {
        store = new SystrumStore(
            artist,
            label,
            8500, // 85% artist
            1000, // 10% resale royalty
            "Systrum Ownership Pass",
            "SYST",
            "ipfs://bafybeibax3qem7piuepgdl7373w4b5h6eo2cq5dhv2sxh66dbwh55a5yxy/metadata/"
        );
        store.setCatalogItem(YKIDR, 0.01 ether, true);
        vm.deal(buyer, 1 ether);
    }

    function test_defaultSplit85_15() public {
        assertEq(store.artistShareBps(), 8500);
        uint256 price = 0.01 ether;
        uint256 beforeArtist = artist.balance;
        uint256 beforeLabel = label.balance;

        vm.prank(buyer);
        uint256 tokenId = store.purchase{value: price}(YKIDR);

        assertEq(store.ownerOf(tokenId), buyer);
        assertEq(artist.balance - beforeArtist, (price * 8500) / 10_000);
        assertEq(label.balance - beforeLabel, (price * 1500) / 10_000);
    }

    function test_ownershipPassesOnTransfer() public {
        vm.prank(buyer);
        uint256 tokenId = store.purchase{value: 0.01 ether}(YKIDR);

        vm.prank(buyer);
        store.transferFrom(buyer, reseller, tokenId);
        assertEq(store.ownerOf(tokenId), reseller);
    }

    function test_resaleRoyaltyToArtist() public {
        (address receiver, uint256 royaltyAmount) = store.royaltyInfo(1, 1 ether);
        assertEq(receiver, artist);
        assertEq(royaltyAmount, 0.1 ether); // 10%
    }

    function test_configurableSplit() public {
        store.setSplit(7000, artist, label);
        assertEq(store.artistShareBps(), 7000);

        vm.prank(buyer);
        store.purchase{value: 0.01 ether}(YKIDR);
        // 70/30 of 0.01 ether
        assertEq(artist.balance, (0.01 ether * 7000) / 10_000);
        assertEq(label.balance, (0.01 ether * 3000) / 10_000);
    }

    function test_custodialMintAfterStripe() public {
        uint256 tokenId = store.mintForBuyer(buyer, YKIDR);
        assertEq(store.ownerOf(tokenId), buyer);
        assertEq(store.tokenCatalog(tokenId), YKIDR);
    }

    function test_revertInactiveCatalog() public {
        store.setCatalogItem(YKIDR, 0.01 ether, false);
        vm.prank(buyer);
        vm.expectRevert(SystrumStore.CatalogInactive.selector);
        store.purchase{value: 0.01 ether}(YKIDR);
    }

    function test_revertWrongPayment() public {
        vm.prank(buyer);
        vm.expectRevert(SystrumStore.IncorrectPayment.selector);
        store.purchase{value: 0.02 ether}(YKIDR);
    }
}
