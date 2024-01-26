"use strict";

// global to hold the User instance of the currently-logged-in user
let currentUser;

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  // ... (existing code)

  // New method to update user profile
  async updateProfile(name, password) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${this.username}`,
        method: "PATCH",
        headers: { Authorization: `Bearer ${this.loginToken}` },
        data: { user: { name, password } },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        this.loginToken
      );
    } catch (error) {
      console.error("updateProfile failed", error);
      throw error;
    }
  }
}

/** Handle login form submission. If login ok, sets up the user instance */

async function login(evt) {
  console.debug("login", evt);
  evt.preventDefault();

  // grab the username and password
  const username = $("#login-username").val();
  const password = $("#login-password").val();

  try {
    // User.login retrieves user info from API and returns User instance
    // which we'll make the globally-available, logged-in user.
    currentUser = await User.login(username, password);

    $loginForm.trigger("reset");

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();
  } catch (error) {
    console.error("login failed", error);
    // Handle specific error cases, e.g., incorrect credentials
    if (error.response && error.response.status === 401) {
      alert("Incorrect username or password. Please try again.");
    }
  }
}

$loginForm.on("submit", login);

/** Handle signup form submission. */

async function signup(evt) {
  console.debug("signup", evt);
  evt.preventDefault();

  const name = $("#signup-name").val();
  const username = $("#signup-username").val();
  const password = $("#signup-password").val();

  try {
    // User.signup retrieves user info from API and returns User instance
    // which we'll make the globally-available, logged-in user.
    currentUser = await User.signup(username, password, name);

    saveUserCredentialsInLocalStorage();
    updateUIOnUserLogin();

    $signupForm.trigger("reset");
  } catch (error) {
    console.error("signup failed", error);
    // Handle specific error cases, e.g., username taken
    if (error.response && error.response.status === 400) {
      alert("Username is already taken. Please choose another.");
    }
  }
}

$signupForm.on("submit", signup);

// New function to handle user profile updates
async function updateUserProfile(evt) {
  evt.preventDefault();

  const newName = $("#profile-name").val();
  const newPassword = $("#profile-password").val();

  try {
    currentUser = await currentUser.updateProfile(newName, newPassword);
    alert("Profile updated successfully!");
  } catch (error) {
    console.error("updateUserProfile failed", error);
    // Handle specific error cases
    alert("Error updating profile. Please try again.");
  }
}

$("#user-profile-form").on("submit", updateUserProfile);

// ... (existing code)
