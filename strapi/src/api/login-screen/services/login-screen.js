'use strict';

/**
 * login-screen service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::login-screen.login-screen');
