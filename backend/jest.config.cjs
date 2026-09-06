module.exports = {
  rootDir: "src",

  testEnvironment: "node",

  testRegex: ".*\\.spec\\.ts$",

  moduleFileExtensions: [
    "ts",
    "js",
    "json"
  ],

  extensionsToTreatAsEsm: [
    ".ts"
  ],

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "<rootDir>/../tsconfig.spec.json"
      }
    ]
  },

  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },

  collectCoverageFrom: [
    "**/*.(t|j)s",
    "!**/*.spec.ts",
    "!**/*.module.ts",
    "!main.ts"
  ],

  coverageDirectory: "../coverage"
};
