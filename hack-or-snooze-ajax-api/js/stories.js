"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;
let currentUser; // Assuming you have a currentUser object

/** Get and show stories when the site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();
  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  const isFavorite = currentUser ? currentUser.isFavorite(story) : false;

  // Adding a star icon for favorited stories
  const star = isFavorite ? "fas" : "far";

  return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="${star} fa-star"></i>
        </span>
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Add a new story when the form is submitted. */
async function addNewStory(evt) {
  evt.preventDefault();

  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();

  const newStoryData = { title, author, url };

  try {
    // Add the new story using the addStory method
    const newStory = await storyList.addStory(currentUser, newStoryData);

    // Clear the form inputs
    $("#story-title").val("");
    $("#story-author").val("");
    $("#story-url").val("");

    // Add the new story to the list and display it
    const $newStory = generateStoryMarkup(newStory);
    $allStoriesList.prepend($newStory);

  } catch (error) {
    console.error(error.message);
  }
}

/** Handle toggling favorites for a story */
async function toggleFavorite(evt) {
  if (!currentUser) return; // If not logged in, do nothing

  const $target = $(evt.target);
  const $story = $target.closest("li");
  const storyId = $story.attr("id");
  const story = storyList.stories.find(s => s.storyId === storyId);

  // Toggle the favorite status
  if (currentUser.isFavorite(story)) {
    await currentUser.removeFavorite(story);
    $target.removeClass("fas").addClass("far");
  } else {
    await currentUser.addFavorite(story);
    $target.removeClass("far").addClass("fas");
  }
}

// Hook up the form submission to the addNewStory function
$("#add-story-form").on("submit", addNewStory);

// Handle favorite toggle on star click
$allStoriesList.on("click", ".star", toggleFavorite);

// ... (The rest of your existing code)

