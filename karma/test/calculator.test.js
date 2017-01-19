describe('Calculator', function() {
    beforeEach(function() {
        var fixture = '<div id="fixture">' +
            '<input id="x" type="text">' +
            '<input id="y" type="text">' +
            '<input id="add" type="button" value="Add Numbers">' +
            'Result: <span id="result"/>' +
            '</div>';

        document.body.insertAdjacentHTML('afterbegin', fixture);
    });

    afterEach(function() {
        document.body.removeChild(document.getElementById('fixture'));
    });

    beforeEach(function() {
        window.calculator.init();
    });

    it('should return 3 for 1 + 2', function() {
        document.getElementById('x').value = 1;
        document.getElementById('y').value = 2;
        document.getElementById('add').click();

        expect(document.getElementById('result').innerHTML).to.equal('3');
    })
});