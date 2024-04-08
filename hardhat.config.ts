import { type HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-ethers';
import 'hardhat-abi-exporter';
import 'hardhat-gas-reporter';
import "@nomiclabs/hardhat-waffle";

const sepolia_URL = 'https://eth-sepolia.g.alchemy.com/v2/doDEH2L2UI3MQ4M0LveZj1HwVDMDyWi3';
const PRIVATE_KEY = 'd4249acf332177ddd9c18385b9c821ec1015c27454bfc9a7ecb858fe14918a80';

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: sepolia_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    },
  }
};

export default config;