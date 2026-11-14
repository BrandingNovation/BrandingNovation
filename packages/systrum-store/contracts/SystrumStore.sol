// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC2981} from "@openzeppelin/contracts/token/common/ERC2981.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title SystrumStore
 * @notice Ownership-pass NFT for Systrum direct-to-fan releases (Base Sepolia first).
 *         Primary sale splits artist/label (default 85/15, configurable).
 *         Secondary sales honor ERC-2981 royalty to the artist (resale cut).
 *         Fans never interact with this contract directly — custodial wallets
 *         are created behind email login by the Systrum API.
 */
contract SystrumStore is ERC721, ERC2981, Ownable, ReentrancyGuard {
    using Strings for uint256;

    uint96 public constant BPS_DENOMINATOR = 10_000;

    address public artistWallet;
    address public labelWallet;

    /// @notice Artist share of primary sale in basis points (default 8500 = 85%).
    uint96 public artistShareBps;

    /// @notice Artist royalty on secondary sales in basis points (default 1000 = 10%).
    uint96 public resaleRoyaltyBps;

    /// @notice IPFS CID / metadata base (e.g. ipfs://bafy.../metadata/)
    string public baseTokenURI;

    /// @notice Catalog id → primary price in wei (native gas token; testnet ETH on Base Sepolia).
    mapping(bytes32 => uint256) public catalogPriceWei;

    /// @notice Catalog id → whether listing is active.
    mapping(bytes32 => bool) public catalogActive;

    /// @notice tokenId → catalog id (album / tier SKU).
    mapping(uint256 => bytes32) public tokenCatalog;

    uint256 private _nextTokenId = 1;

    event CatalogListed(bytes32 indexed catalogId, uint256 priceWei, bool active);
    event OwnershipPassMinted(
        uint256 indexed tokenId,
        bytes32 indexed catalogId,
        address indexed buyer,
        uint256 priceWei,
        uint256 artistAmount,
        uint256 labelAmount
    );
    event SplitUpdated(uint96 artistShareBps, address artistWallet, address labelWallet);
    event ResaleRoyaltyUpdated(uint96 resaleRoyaltyBps);
    event BaseURIUpdated(string baseTokenURI);

    error InvalidSplit();
    error InvalidAddress();
    error CatalogInactive();
    error IncorrectPayment();
    error TransferFailed();

    constructor(
        address artistWallet_,
        address labelWallet_,
        uint96 artistShareBps_,
        uint96 resaleRoyaltyBps_,
        string memory name_,
        string memory symbol_,
        string memory baseTokenURI_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        if (artistWallet_ == address(0) || labelWallet_ == address(0)) revert InvalidAddress();
        if (artistShareBps_ > BPS_DENOMINATOR) revert InvalidSplit();
        if (resaleRoyaltyBps_ > BPS_DENOMINATOR) revert InvalidSplit();

        artistWallet = artistWallet_;
        labelWallet = labelWallet_;
        artistShareBps = artistShareBps_;
        resaleRoyaltyBps = resaleRoyaltyBps_;
        baseTokenURI = baseTokenURI_;

        // Collection-level royalty receiver = artist (ownership / resale cut).
        _setDefaultRoyalty(artistWallet_, resaleRoyaltyBps_);
    }

    // -------------------------------------------------------------------------
    // Admin
    // -------------------------------------------------------------------------

    function setCatalogItem(bytes32 catalogId, uint256 priceWei, bool active) external onlyOwner {
        catalogPriceWei[catalogId] = priceWei;
        catalogActive[catalogId] = active;
        emit CatalogListed(catalogId, priceWei, active);
    }

    function setSplit(uint96 artistShareBps_, address artistWallet_, address labelWallet_)
        external
        onlyOwner
    {
        if (artistShareBps_ > BPS_DENOMINATOR) revert InvalidSplit();
        if (artistWallet_ == address(0) || labelWallet_ == address(0)) revert InvalidAddress();
        artistShareBps = artistShareBps_;
        artistWallet = artistWallet_;
        labelWallet = labelWallet_;
        _setDefaultRoyalty(artistWallet_, resaleRoyaltyBps);
        emit SplitUpdated(artistShareBps_, artistWallet_, labelWallet_);
    }

    function setResaleRoyaltyBps(uint96 resaleRoyaltyBps_) external onlyOwner {
        if (resaleRoyaltyBps_ > BPS_DENOMINATOR) revert InvalidSplit();
        resaleRoyaltyBps = resaleRoyaltyBps_;
        _setDefaultRoyalty(artistWallet, resaleRoyaltyBps_);
        emit ResaleRoyaltyUpdated(resaleRoyaltyBps_);
    }

    function setBaseTokenURI(string calldata baseTokenURI_) external onlyOwner {
        baseTokenURI = baseTokenURI_;
        emit BaseURIUpdated(baseTokenURI_);
    }

    /**
     * @notice Custodial mint used after Stripe test checkout settles.
     *         Payment already happened off-chain; on-chain pass is $0 mint to fan wallet.
     */
    function mintForBuyer(address buyer, bytes32 catalogId)
        external
        onlyOwner
        returns (uint256 tokenId)
    {
        if (buyer == address(0)) revert InvalidAddress();
        if (!catalogActive[catalogId]) revert CatalogInactive();
        tokenId = _nextTokenId++;
        tokenCatalog[tokenId] = catalogId;
        _safeMint(buyer, tokenId);
        emit OwnershipPassMinted(tokenId, catalogId, buyer, 0, 0, 0);
    }

    // -------------------------------------------------------------------------
    // Primary sale (native testnet ETH — optional path for on-chain testing)
    // -------------------------------------------------------------------------

    function purchase(bytes32 catalogId) external payable nonReentrant returns (uint256 tokenId) {
        if (!catalogActive[catalogId]) revert CatalogInactive();
        uint256 price = catalogPriceWei[catalogId];
        if (msg.value != price) revert IncorrectPayment();

        uint256 artistAmount = (msg.value * artistShareBps) / BPS_DENOMINATOR;
        uint256 labelAmount = msg.value - artistAmount;

        tokenId = _nextTokenId++;
        tokenCatalog[tokenId] = catalogId;
        _safeMint(msg.sender, tokenId);

        // Effects/events before interactions (CEI) — split is fixed at call time.
        emit OwnershipPassMinted(tokenId, catalogId, msg.sender, price, artistAmount, labelAmount);

        _pay(artistWallet, artistAmount);
        _pay(labelWallet, labelAmount);
    }

    function _pay(address to, uint256 amount) internal {
        if (amount == 0) return;
        // Artist/label are admin-set, not arbitrary user input.
        (bool ok,) = to.call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    // -------------------------------------------------------------------------
    // Metadata / interfaces
    // -------------------------------------------------------------------------

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(baseTokenURI, tokenId.toString(), ".json"));
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
