module.exports = {
  /**
   * Promise to fetch authenticated user.
   * @return {Promise}
   */
  fetchAuthenticatedUser(id) {
    return strapi
      .query("plugin::users-permissions.user")
      .findOne({ where: { id }, populate: ["role", "organizations"] });
  },
};
