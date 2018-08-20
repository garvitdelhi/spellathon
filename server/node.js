
const Memcached = require('memcached');
const memcached = new Memcached('127.0.0.1:11211');

memcached.get('store', (err, data) => {
    console.log(data, err, 'here');
});

