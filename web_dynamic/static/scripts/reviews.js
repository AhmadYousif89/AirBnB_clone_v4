const $ = window.$;
const cache = {
  reviews: {},
  users: {}
};

export async function loadReviews(apiUrl, placeElement, placeId) {
  const url = `${apiUrl}/places/${placeId}/reviews`;
  const ul = $(placeElement).find('.reviews .all-reviews ul');
  ul.empty();
  ul.append('<li class="loading">Loading reviews . . .</li>');

  if (cache.reviews[placeId]) {
    const reviews = cache.reviews[placeId];
    updateReviews(apiUrl, placeElement, reviews, ul);
    return;
  }

  try {
    const reviews = await $.ajax(url);
    cache.reviews[placeId] = reviews;
    console.log('cache:', cache);
    updateReviews(apiUrl, placeElement, reviews, ul);
  } catch (error) {
    ul.empty();
    ul.append('<li class="no-data">Failed to load reviews :/</li>');
    $(placeElement).find('.reviews .review-counter').html('<small>❔</small>');
    console.log('Failed to load reviews');
  }
}

const CACHE_EXPIRATION_MS = 5 * 60 * 1000; // 5 minutes

function isCacheExpired(timestamp) {
  return Date.now() - timestamp > CACHE_EXPIRATION_MS;
}

async function getUser(apiUrl, userId) {
  const cachedUser = cache.users[userId];

  if (cachedUser && !isCacheExpired(cachedUser.timestamp)) {
    return cachedUser.data;
  }

  const url = `${apiUrl}/users/${userId}`;
  try {
    const user = await $.get(url);
    cache.users[userId] = { data: user, timestamp: Date.now() };
    return user;
  } catch (error) {
    console.log('Failed to load user');
    return null;
  }
}

async function updateReviews(apiUrl, placeElement, reviews, ul) {
  ul.empty();
  let reviewCount = reviews.length;
  reviewCount = reviewCount <= 99 ? reviewCount : '99+';
  if (reviewCount === 0) {
    ul.append('<li class="no-data">No reviews for this place</li>');
  }
  $(placeElement).find('.reviews .review-counter').text(reviewCount);
  for (const review of reviews) {
    const user = await getUser(apiUrl, review.user_id);
    const userName = user ? `${user.first_name} ${user.last_name}` : 'Unknown';
    ul.append(
      `<li class="review">
        <h4>From ${userName}</h4>
        <p>${review.text}</p>
      </li>`
    );
  }
}
