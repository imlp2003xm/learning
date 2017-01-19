var oracledb = require('oracledb');

oracledb.getConnection({
    user: 'zportal',
    password: 'zportal',
    connectString: '(DESCRIPTION=(ADDRESS_LIST=(ADDRESS=(PROTOCOL=TCP)(HOST=10.32.52.125)(PORT=1521)))(CONNECT_DATA=(SERVICE_NAME=adb031)))'
}, (err, connection) => {
    if (err) {
        console.error(err.message);
        return;
    }

    connection.execute('select countryid, name from vcountrycode', [], (err, result) => {
        if (err) {
            console.error(err.message);
            doRelease(connection);
            return;
        }

        console.log(result.metaData);
        console.log(result.rows);
        doRelease(connection);
    });
});

function doRelease(connection) {
    connection.release((err) => {
        if (err) {
            console.error(err.message);
        }
    });
}