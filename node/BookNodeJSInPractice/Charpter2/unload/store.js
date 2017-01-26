var itemsCount = 0;

module.exports = {
    addItem: function() {
        itemsCount++;
    },
    printItemsCount: function() {
        console.log(itemsCount);
    }
};