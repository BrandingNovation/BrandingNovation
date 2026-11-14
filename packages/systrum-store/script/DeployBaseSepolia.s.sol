// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {SystrumStore} from "../contracts/SystrumStore.sol";

/**
 * @dev Deploy ONLY to Base Sepolia (chain id 84532). Refuses other chains.
 *
 *   forge script script/DeployBaseSepolia.s.sol:DeployBaseSepolia \
 *     --rpc-url $BASE_SEPOLIA_RPC_URL --broadcast --private-key $DEPLOYER_PRIVATE_KEY
 */
contract DeployBaseSepolia is Script {
    uint256 internal constant BASE_SEPOLIA_CHAIN_ID = 84532;
    bytes32 internal constant YKIDR_STANDARD = keccak256("ykidr-standard");
    bytes32 internal constant YKIDR_PREMIUM = keccak256("ykidr-premium");

    function run() external {
        require(block.chainid == BASE_SEPOLIA_CHAIN_ID, "REFUSE: only Base Sepolia (84532)");

        address artist = vm.envOr("ARTIST_WALLET", msg.sender);
        address label = vm.envOr("LABEL_WALLET", msg.sender);
        string memory baseURI = vm.envOr(
            "BASE_TOKEN_URI",
            string(
                "ipfs://bafybeibax3qem7piuepgdl7373w4b5h6eo2cq5dhv2sxh66dbwh55a5yxy/metadata/"
            )
        );

        uint256 pk = vm.envUint("DEPLOYER_PRIVATE_KEY");
        vm.startBroadcast(pk);

        SystrumStore store = new SystrumStore(
            artist,
            label,
            8500,
            1000,
            "Systrum Ownership Pass",
            "SYST",
            baseURI
        );

        // Testnet catalog prices (small amounts for faucet wallets).
        store.setCatalogItem(YKIDR_STANDARD, 0.001 ether, true);
        store.setCatalogItem(YKIDR_PREMIUM, 0.003 ether, true);

        vm.stopBroadcast();

        console2.log("SystrumStore deployed:", address(store));
        console2.log("chainId:", block.chainid);
        console2.log("artist:", artist);
        console2.log("label:", label);
        console2.log("YKIDR CID base:", baseURI);
    }
}
