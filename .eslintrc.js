module.exports = {
  extends: ['uphold'],
  overrides: [
    {
      env: { mocha: true },
      files: ['tests/**/*.js']
    }
  ],
  root: true
};
