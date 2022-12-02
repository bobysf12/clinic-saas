'use strict';

/**
 * patient-record service.
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::patient-record.patient-record');
