//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "hardhat/console.sol";
error FundMe__NotOwner();

/**@title A contract for the crowd Funding
 * @author Dhananjay Rathod
 * @notice This contract is to demo a sample funding contract
 */

contract FundMe {
    //Type Declarations
    //state variable
    //private and internal variable cost less
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    AggregatorV3Interface public s_priceFeed;
    address[] public s_funders;
    mapping(address => uint256) public s_addressToAmountFunded; //storage variable thus s_
    address private immutable i_owner;

    //modifiers
    modifier onlyOwner() {
        // require(msg.sender==owner,"sender is not owner");
        if (msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    //functions order:
    //constructor
    //receive
    //fallback
    //external
    //public
    //internal
    //private
    //view/pure

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
        // console.log(owner);
    }

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }

    //msg.value is in wei;

    function fund() public payable {
        require(
            getConversionRate(msg.value, s_priceFeed) >= MINIMUM_USD,
            "Didnt send enough"
        );
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function getPrice(AggregatorV3Interface priceFeed)
        public
        view
        returns (uint256)
    {
        (, int256 price, , , ) = priceFeed.latestRoundData();
        //ETH in terms of USD
        return uint256(price * 1e10);
    }

    function withdraw() public onlyOwner {
        //for loop
        require(msg.sender == i_owner);
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        //reset array
        s_funders = new address[](0); //0 means 0 element

        //sender ether
        //transfer
        //send
        //call
        //payable(...)=payable address
        payable(msg.sender).transfer(address(this).balance);
        //fails -->throws error
        bool sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess, "send failed");
        //fails -->returns bool

        //this--->this contract
    }

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory funders = s_funders;
        require(msg.sender == i_owner);
        for (
            uint256 funderIndex = 0;
            funderIndex < funders.length;
            funderIndex++
        ) {
            address funder = funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        //reset array
        s_funders = new address[](0); //0 means 0 element

        //sender ether
        //transfer
        //send
        //call
        //payable(...)=payable address
        payable(msg.sender).transfer(address(this).balance);
        //fails -->throws error
        bool sendSuccess = payable(msg.sender).send(address(this).balance);
        require(sendSuccess, "send failed");
        //fails -->returns bool

        //this--->this contract
    }

    function getConversionRate(
        uint256 ethAmount,
        AggregatorV3Interface priceFeed
    ) public view returns (uint256) {
        uint256 ethPrice = getPrice(priceFeed);
        uint256 ethAmountInUsd = (ethPrice * ethAmount) / 1e18;
        return ethAmountInUsd;
    }

    //declared onc e
}
//what if funded without running fund func

//constant
//immutable
