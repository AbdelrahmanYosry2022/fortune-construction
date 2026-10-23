// Preloaded into child processes started by tests: makes every MongoDB connection fail at once,
// so a script under test can never touch a real database on the developer's machine.
const mongoose = require('mongoose');

mongoose.connect = async () => {
  throw new Error('MongoDB connections are blocked in this test process');
};
