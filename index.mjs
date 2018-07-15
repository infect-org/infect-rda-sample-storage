'use strict';

import Service from './src/Service';
import logd from 'logd';
import ConsoleTransport from 'logd-console-transport';
import fixtures from './fixtures/fixtures'



// enable console logging
logd.transport(new ConsoleTransport());



export {
    fixtures,
    Service as default
};