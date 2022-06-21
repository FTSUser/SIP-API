/**
 * Created by Bhargav Butani on 10.07.2021
 */

const signup = require("./user-signup");
const addFavorites = require("./add-favorites");
const getFavorites = require("./get-favorites");
const getUser = require("./get-user");
const updateProfile = require("./update-profile");
const removeFavorites = require("./remove-favorites");
const addCart = require("./add-cart");
const getCart = require("./get-cart");
const removeCart = require("./remove-cart");

module.exports = exports = {
  signup,
  addFavorites,
  getFavorites,
  getUser,
  updateProfile,
  removeFavorites,
  addCart,
  getCart,
  removeCart,
};
