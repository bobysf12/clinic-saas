'use strict';

/**
 * icd-10 service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::icd-10.icd-10');
