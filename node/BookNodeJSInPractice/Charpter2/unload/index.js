var store = require('./store');

store.addItem();
store.addItem();
store.addItem();
store.printItemsCount();

store = require('./store');
store.addItem();
store.printItemsCount();

delete require.cache[require.resolve('./store')];

store = require('./store');
store.addItem();
store.printItemsCount();