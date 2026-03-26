(function() {
  'use strict';

  var postURLs,
      isFetchingPosts = false,
      shouldFetchPosts = true;

  var urlParams = new URLSearchParams(window.location.search);

  function getJSON(url, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        cb(JSON.parse(xhr.responseText));
      }
    };
    xhr.send();
  }

  if (urlParams.has('tag')) {
    var tag = urlParams.get('tag');
    var tagEl = document.getElementById(tag);
    if (tagEl) tagEl.classList.remove('hidden');

    getJSON('./posts-by-tag.json', function(data) {
      var tagItem = data.find(function(el) { return el.tag === tag; });
      if (tagItem) postURLs = tagItem.posts;
      if (!postURLs || postURLs.length <= postsToLoad) disableFetching();
    });
  } else {
    getJSON('./all-posts.json', function(data) {
      postURLs = data.posts;
      if (!postURLs || postURLs.length <= postsToLoad) disableFetching();
    });
  }

  var visibleMaster = document.querySelector('.tag-master:not(.hidden)');
  var postList = visibleMaster ? visibleMaster.querySelector('.post-list') : null;
  var postsToLoad = postList ? postList.children.length : 3;
  var loadNewPostsThreshold = 10;

  var spinner = document.querySelector('.spinner');
  if (!spinner) shouldFetchPosts = false;

  window.addEventListener('scroll', function() {
    if (!shouldFetchPosts || isFetchingPosts) return;

    var windowHeight = window.innerHeight;
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight = document.documentElement.scrollHeight;

    if ((docHeight - loadNewPostsThreshold) < (windowHeight + scrollTop)) {
      fetchPosts();
    }
  });

  function fetchPosts() {
    if (!postURLs) return;
    isFetchingPosts = true;

    var target = document.querySelector('.tag-master:not(.hidden) .post-list');
    var postCount = target ? target.children.length : 0;
    var loadedPosts = 0;

    var callback = function() {
      loadedPosts++;
      var postIndex = postCount + loadedPosts;

      if (postIndex > postURLs.length - 1) {
        disableFetching();
        return;
      }

      if (loadedPosts < postsToLoad) {
        fetchPostWithIndex(postIndex, target, callback);
      } else {
        isFetchingPosts = false;
      }
    };

    fetchPostWithIndex(postCount + loadedPosts, target, callback);
  }

  function fetchPostWithIndex(index, target, callback) {
    var postURL = postURLs[index];
    var xhr = new XMLHttpRequest();
    xhr.open('GET', postURL, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4 && xhr.status === 200) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(xhr.responseText, 'text/html');
        var posts = doc.querySelectorAll('.post');
        posts.forEach(function(post) {
          if (target) target.appendChild(post.cloneNode(true));
        });
        callback();
      }
    };
    xhr.send();
  }

  function disableFetching() {
    shouldFetchPosts = false;
    isFetchingPosts = false;
    if (spinner) spinner.style.display = 'none';
  }
})();
