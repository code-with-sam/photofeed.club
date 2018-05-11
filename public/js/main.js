
let query = { 'tag': 'photofeed', 'limit': 7 }
let converter = new showdown.Converter({ tables: true })
let allContent = []
let allUsers = []
let msnry;
let $gallery = $('.gallery')
let params, photographer;


if ( $('main').hasClass('feeds') ) {
  getFeatured(query, true)
  initCarousel()
}

if ( $('main').hasClass('photographers') ) {
  getPhotographers()
  steem.api.getDiscussionsByBlog(query, (err, result) => {
    if(err) return console.log(err)
    displayHeaderImages(result.filter( post => post.author !== 'photofeed'))
  });
  initCarousel()
}

if ( $('main').hasClass('profile') ) {
  let photographer = $('.profile').data('username')
  $('.nav__link--active').text(`Photos by @${photographer}`)
  $('.nav__link--active').attr('href', `https://steemit.com/@${photographer}`)
  query = { 'tag': photographer, 'limit': 14 }
  getBlog(query, true)
}


$('.gallery').on('click', '.item', (e) => {
    loadPost(e.currentTarget)
})

$('.faq').on('click', (e) => {
    e.preventDefault()
    lastTop = $(window).scrollTop();
    $('body').addClass( 'noscroll' ).css( { top: -lastTop } )
    $('.overlay, .overlay__faq, .overlay__bg').addClass('overlay--active')
})

$('.nav__link').on('click', (e) => {
  let filter = $(e.currentTarget).data('filter');
  $('.nav__link').removeClass('nav__link--active');
  $(e.currentTarget).addClass('nav__link--active');
  $('.gallery').empty()
  allContent = []

  if(filter === 'trending'){
    getTrending(query, true)
  } else if (filter === 'featured') {
    getFeatured(query, true)
  } else {
    getLatest(query, true)
  }
})

$('.overlay__bg').on('click', () => {
  $('body').removeClass('noscroll')
  $(window).scrollTop( lastTop );
  $('.overlay, .overlay__bg, .overlay__content, .overlay__faq .overlay__photographers').removeClass('overlay--active')
})



$('.overlay__bg').on('click', () => {
  $('body').removeClass('noscroll')
  $(window).scrollTop( lastTop );
  $('.overlay, .overlay__bg, .overlay__content, .overlay__faq .overlay__photographers').removeClass('overlay--active')
})


$('.photographers__show').on('click', () => {
  $('.photographers__all').fadeIn()
  $('.photographers__show').fadeOut()
})

function getPhotographers(){
  $.ajax({
    url: '/photographers.json',
    type: "GET",
    dataType: "json",
    success: function (data) {
        displayPhotogaphers(data.result)
    },
    error: function () {
        console.log("error");
    }
});
}

function displayPhotogaphers(photographers){

  photographers.sort((a, b) => {
    if (a.featured > b.featured ) {
      return -1;
    } else if (a.featured < b.featured) {
      return 1;
    } else {
      return 0;
    }
  });
  photographers.shift()

  steem.api.getDiscussionsByBlog( { 'tag': 'photofeed', 'limit': 10 }, (err, result) => {
    if (err) return console.log(err)
    const featuredPosts = result.filter( post => post.author !== 'photofeed')
    for (var i = 0; i < 6; i++) {
      console.log(featuredPosts[i])
      let index = photographers.findIndex(photographer => photographer.username === featuredPosts[i].author)
      console.log(index)
      // if (index >= 0) {
        let photog = photographers[index]

        console.log(photog)
        appendPhotogapher(photog, '.photographers__latest')
      // }

    }
  });


  $('.total-photographers').text(photographers.length)
  for (var i = 0; i < 6; i++) {
    appendPhotogapher(photographers[i], '.photographers__top')
  }
  for (var i = 6; i < photographers.length; i++) {
    // appendPhotogapher(photographers[i], '.photographers__all')
  }
}

function appendPhotogapher(photogapher, location) {
  let template = `<div class="photogapher__single cf">
    <a href="/@${photogapher.username}">
    <img class="photogapher__avatar" src="${photogapher.avatar}" onerror="this.onerror=null;this.src='http://placehold.it/50x50?text=?';">
    <div class="photogapher__info">
      <h3 class="photogapher__username" >@${photogapher.username}</h3>
      <h3 class="photogapher__featured" >Featured: ${photogapher.featured}</h3>
    </div>
    <div class="photogapher__link">
      <svg x="0px" y="0px" viewBox="0 0 50 50" style="enable-background:new 0 0 50 50;">
      <g transform="translate(0,-952.36218)">
      <path class="st0" d="M10.5,961.6l19.9,15.3c0.3,0.3,0.3,0.7,0,1l-19.9,15.3c-0.1,0.1-0.3,0.1-0.5,0.1c-0.2,0-0.3-0.1-0.4-0.2
      c-0.1-0.1-0.1-0.3-0.1-0.5c0-0.2,0.1-0.3,0.2-0.4L29,977.3L9.7,962.6C9,962,9.8,961,10.5,961.6L10.5,961.6z"/>
      <path class="st0" d="M10.5,954l29.8,22.9c0.3,0.3,0.3,0.7,0,1l-29.8,22.9c-0.7,0.5-1.5-0.4-0.8-1l29.2-22.4L9.7,955
      C9.1,954.4,9.9,953.5,10.5,954z"/>
      </g>
      </svg>
    </div>
    </a>
  </div>`
  $(location).append(template)
}


function getFeatured(query, initial, callback){
  steem.api.getDiscussionsByBlog(query, (err, result) => {
    const featuredPosts = result.filter( post => post.author !== 'photofeed')
    if (err === null) {
      displayImages(featuredPosts, initial, initial ? false : callback)
      getaccounts(result.map(post => post.author))
      if(initial) displayHeaderImages(featuredPosts)
    } else {
      console.log(err);
    }
  });
}

function getTrending(query, initial, callback){

  steem.api.getDiscussionsByTrending(query, (err, result) => {
    if (err === null) {
      displayImages(result, initial, initial ? false : callback)
      getaccounts(result.map(post => post.author))
      if(initial) displayHeaderImages(featuredPosts)
    } else {
      console.log(err);
    }
  });
}

function getLatest(query, initial, callback){

  steem.api.getDiscussionsByCreated(query, (err, result) => {
    if (err === null) {
      displayImages(result, initial, initial ? false : callback)
      getaccounts(result.map(post => post.author))
      if(initial) displayHeaderImages(featuredPosts)
    } else {
      console.log(err);
    }
  });
}

function getBlog(query, initial, callback){
  steem.api.getDiscussionsByBlog(query, (err, result) => {
    if (err === null) {
      result = result.filter(post => {
        let tags = JSON.parse(post.json_metadata).tags
        if( tags.includes('photofeed') ) return post
      })
      displayImages(result, initial, initial ? false : callback)
      getaccounts(result.map(post => post.author))
    } else {
      console.log(err);
    }
  });
}

function getMoreContent(){
  let lastItem = allContent[allContent.length - 1]
  let filter = $('.nav__link--active').data('filter')
  let query = {
      'tag':
      'photofeed',
      'limit': 24,
      start_author: lastItem.author,
      start_permlink: lastItem.permlink }

      let callback = (items) => {
          items.forEach((item) => {
              let $item = $(item)
              $gallery.append($item)

              $item.children('img').on('load', (e) => {
                $(e.currentTarget).parent().removeClass('hidden')
                $gallery.masonry( 'appended', $(e.currentTarget).parent())
              })
          })
          setInfiniteScrollPoint()
      }

      if(filter === 'trending'){
        getTrending(query, false, callback)
      } else if (filter === 'featured') {
        getFeatured(query, false, callback)
      } else if (filter === 'latest')  {
        getLatest(query, false, callback)
      } else {
        query = {
            'tag':
            photographer,
            'limit': 24,
            start_author: lastItem.author,
            start_permlink: lastItem.permlink }
        getBlog(query, false, callback)
      }

}


function getaccounts(usernames){
  steem.api.getAccounts(usernames, (err, result) => {
    allUsers = allUsers.concat(result)
  })
}

function displayImages(result, initialLoad, callback){
  let items = []
  for (let i = 0; i < result.length ; i++) {
      let post = result[i];

      var urlRegex = /(https?:\/\/[^\s]+)/g;
      post.body = post.body.replace(urlRegex, (url) => {
        let last = url.slice(-3)
        if(last === 'jpg' || last === 'png' || last === 'jpe' || last === 'gif')  {
          return '<img src="' + url + '">';
        } else {
          return url
        }
      })

      if( typeof JSON.parse(post.json_metadata).image === 'undefined' ){
        image = genImageInHTML(post.body)
      } else {
        image = JSON.parse(post.json_metadata).image[0]
      }

      allContent.push(post);
      let itemTemplate = `
        <div class="item hidden" data-url="${post.url}" data-permlink="${ post.permlink }">
          <img class="item__image " src="https://steemitimages.com/480x768/${image}" onerror="this.src='http://placehold.it/500x500'">
          <div class="item__photographer">
            <span>@${post.author}</span>
          </div>
          <div class="item__like">
            <span class="item__heart">♥</span>
            <span class="item__heart-count">${post.net_votes}</span>
          </div>
          <div class="item__overlay"></div>
        </div>
        `
      items.push(itemTemplate)
  }
  if(initialLoad){
    checkImages(items)
  } else {
    items.shift()
    callback(items)
  }
}

function genImageInHTML(markdown){
    let placeholder = document.createElement('div');
    placeholder.innerHTML = converter.makeHtml(markdown)
    let image = placeholder.querySelector('img');
    return image ? image.src : ''
}

function checkImages(items){

  items.forEach((item) => {
    $gallery.append(item);
  })

  let images = $('img.item__image');
  let loaded = 0;

  images.on('load',() => {
    loaded++;
    if (loaded == images.length )
        initMasonry(images)
  });
}

function initMasonry(images){
  images.parent().removeClass('hidden')

  if( $('.gallery').data('masonry') ) $gallery.masonry('destroy')

  $gallery.masonry({
    itemSelector: '.item',
    columnWidth: '.item',
    gutter: 16,
    percentPosition: true
  });
  setInfiniteScrollPoint()
}

function setInfiniteScrollPoint(){
  $('.item').last().on('inview', function(event, isInView) {
    if (isInView) {
      getMoreContent()
      $('.item').last().off('inview')
    }
  });
}

function loadPost(item) {
  let post = $(item).data()
  let rawPost = allContent.filter( x  => x.permlink === post.permlink )[0]
  let allCopy = allUsers.map(x => Object.assign({}, x))
  let user = allCopy.filter( x  => x.name === rawPost.author )[0]

  let profileImage = 'img/default-user.jpg';

  try {

    if (user.json_metadata == '' ||
    user === undefined ||
    user.json_metadata == 'undefined' ||
    user.json_metadata === undefined ) {
      user.json_metadata = { profile_image : ''}
    } else {
      user.json_metadata = JSON.parse(user.json_metadata).profile
    }

    if (user.json_metadata === undefined){
      user.json_metadata = { profile_image : ''}
    }
    profileImage = user.json_metadata.profile_image ? 'https://steemitimages.com/128x128/' + user.json_metadata.profile_image : '';

  } catch(err){
    console.log(err)
  }

  let html = converter.makeHtml(rawPost.body)
  html = html.replace('<p><br></p>', '')
  html = html.replace('<p></p>', '')

  lastTop = $(window).scrollTop();

  $('body').addClass( 'noscroll' ).css( { top: -lastTop } )

  let tags = JSON.parse(rawPost.json_metadata).tags.reduce( (all,tag) => all + `<span>${tag}</span>`, '')
  let header = `
  <div class="overlay__mata cf">
    <div class="overlay__author">
      <img class="overlay__author-img" width="35" height="35" src="${profileImage}">
      <div class="overlay__author-info">
        <span class="overlay__author-name">${( user.json_metadata.name ?  user.json_metadata.name : user.name ) }</span>
        <a href="profile.html?photographer=${user.name}"class="overlay__author-username">@${user.name}</a>

      </div>
    </div>
    <div class="overlay__tags">${tags}</div>
  </div>
    <h1 class="overlay__title title">${rawPost.title}</h1>
    <hr class="overlay__border">
  `
  let comments = `<section class="finally-comments" data-id="https://steemit.com/${post.url}" data-reputation="true" data-values="true" data-profile="true"></section>`
  $('.overlay__content').empty()
  $('.overlay__content').append(header + html + comments)
  $('.overlay, .overlay__bg, .overlay__content').addClass('overlay--active')

  finallyCommentsSystem.init()
  $('.overlay').scrollTop(0)
}

function uniqueArray(arrArg) {
  return arrArg.filter(function(elem, pos,arr) {
    return arr.indexOf(elem) == pos;
  });
};

function displayHeaderImages(images) {
  for (let i = 3; i < 6 ; i++) {
      let post = images[i];
      var urlRegex = /(https?:\/\/[^\s]+)/g;
      post.body = post.body.replace(urlRegex, (url) => {
        let last = url.slice(-3)
        if(last === 'jpg' || last === 'png' || last === 'peg' || last === 'gif')  {
          return '<img src="' + url + '">';
        } else {
          return url
        }
      })
      if( typeof JSON.parse(post.json_metadata).image === 'undefined' ){
        image = genImageInHTML(post.body)
      } else {
        image = JSON.parse(post.json_metadata).image[0]
      }
      $('.header__bg--'+(i-2)).css('background-image', `url(${image})`)
  }
}

function initCarousel() {
  $('header > .header__bg:gt(0)').fadeOut();
  setInterval(function() {
    $('header > .header__bg:first')
      .fadeOut(1000)
      .next()
      .fadeIn(1000)
      .end()
      .appendTo('header');
  },  4000);
}
