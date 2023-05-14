// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

//Importing external code(contract) from github
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library PriceConverter {
    // Get price from another external contract
    function getPrice(
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        // ETH In USD
        // Converting in uint256, same as minUsd
        return uint256(price * 1e10);
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) internal view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed); // ethPrice = 1800_000000000000000000
        // ethAmount = 1_0000000000000000
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        // ethAmountInUsd = 1800$
        return ethAmountInUsd;
    }
}
