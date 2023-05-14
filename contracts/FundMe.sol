// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./PriceConverter.sol";

// creating custom error outside of the contract
error FundMe__NotOwner();

/**
 * @title A contract for crowd funding
 * @author Luigi Drnasin
 * @notice This contract is to demo a samle funding contract
 * @dev This implements price feeds as our library
 */

contract FundMe {
    // Type declarions
    using PriceConverter for uint256;
    // State variables
    uint256 public constant MIN_USD = 50 * 1e18;
    address private immutable i_owner;
    address[] private s_funders;
    mapping(address => uint256) private s_addressToAmountFounded;
    AggregatorV3Interface private s_priceFeed;

    modifier onlyOwner() {
        //require(msg.sender == i_owner, "Sender is not owner");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        // _; => doing the rest of the code
        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    // It runs when contract is deployed
    constructor(address priceFeedAddress) {
        // Owner will be the person who deployed the contract
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function fund() public payable {
        // We need to send minimum or more if we want fund contract
        // msg.value is considering as a first paramethar of the getConversion func
        require(
            msg.value.getConversionRate(s_priceFeed) >= MIN_USD,
            "No enough ether sent"
        );
        s_funders.push(msg.sender);
        s_addressToAmountFounded[msg.sender] += msg.value;
    }

    function withdraw() public payable onlyOwner {
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            // reset mapping
            address funder = s_funders[funderIndex];
            s_addressToAmountFounded[funder] = 0;
        }
        // reset array (0) zero items left, if (1) was provided than array will contain first item from previous array
        s_funders = new address[](0);

        (bool callSuccess, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(callSuccess, "Call failed");
    }

    function cheaperWithdraw() public payable onlyOwner {
        // Creating address array in memory, which is same as s_funders array(storage)
        address[] memory funders = s_funders;
        // mappings can't be in memory
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            // Reset mapping with memory variable
            address funder = funders[funderIndex];
            s_addressToAmountFounded[funder] = 0;
        }
        // reset array (0) zero items left, if (1) was provided than array will contain first item from previous array
        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success);
    }

    // Hiding variables inside the func
    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFounded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}
