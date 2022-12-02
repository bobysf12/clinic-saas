'use strict';

/**
 * outpatient service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::outpatient.outpatient');
