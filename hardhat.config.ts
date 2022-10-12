import '@typechain/hardhat';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-waffle';
import 'hardhat-deploy';
import 'solidity-coverage';
import 'hardhat-contract-sizer';
import 'hardhat-gas-reporter';

import { HardhatUserConfig } from 'hardhat/types';

export default {
	solidity: '0.8.9',
	settings: {
		optimizer: {
			enabled: true,
			runs: 500,
		},
	},
	typechain: {
		outDir: 'types/',
		target: 'ethers-v5',
	},
	contractSizer: {
		alphaSort: true,
		runOnCompile: true,
		disambiguatePaths: false,
	},
	namedAccounts: {
		deployer: 0,
		team: 1,
	},
	networks: {
		hardhat: {
			initialBaseFeePerGas: 0,
		},
	},
	gasReporter: {
		currency: 'USD',
		gasPrice: 21,
	},
} as HardhatUserConfig;