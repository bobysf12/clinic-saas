'use strict';

/**
 * medical-treatment service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::medical-treatment.medical-treatment');
