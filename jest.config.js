module.exports = {
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  // Cold CI runs transform React Native on first render; 5 s is too tight.
  testTimeout: 20000,
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation)/)',
  ],
};
