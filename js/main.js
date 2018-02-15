
let query = { 'tag': 'photofeed', 'limit': 14 }
let converter = new showdown.Converter(
    { tables: true }
)
let allContent = []
let allUsers = []

$('.gallery').on('click', '.item', (e) => {
    loadPost(e.currentTarget)
})


$('.nav__link').on('click', (e) => {
  let filter = $(e.currentTarget).data('filter');
  $('.nav__link').removeClass('nav__link--active');
  $(e.currentTarget).addClass('nav__link--active');
  $('.gallery').empty()
  if(filter === 'trending'){
    getTrending()
  } else {
    getLatest()
  }
})


getTrending()

function getTrending(){

  steem.api.getDiscussionsByTrending(query, (err, result) => {
    if (err === null) {
      displayImages(result)
      getaccounts(result.map(post => post.author))
    } else {
      console.log(err);
    }
  });
}

function getLatest(){

  steem.api.getDiscussionsByCreated(query, (err, result) => {
    if (err === null) {
      displayImages(result)
      getaccounts(result.map(post => post.author))
    } else {
      console.log(err);
    }
  });
}

function getaccounts(usernames){
  steem.api.getAccounts(usernames, (err, result) => {
    allUsers = allUsers.concat(result)
  })
}

function displayImages(result){
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
      let placeholder = document.createElement('div');
      placeholder.innerHTML = converter.makeHtml(post.body)
      let image = placeholder.querySelector('img') ;


      allContent.push(post);

      $('.gallery').append(`
        <div class="item " data-url="${post.url}" data-permlink="${ post.permlink }">
          <img class="item__image " src="https://steemitimages.com/480x768/${image.src}" onerror="">
          <div class="item__photographer">
            <span>@${post.author}</span>
          </div>
          <div class="item__like">
            <span class="item__heart">♥</span>
            <span class="item__heart-count">${post.net_votes}</span>
          </div>
          <div class="item__overlay"></div>
        </div>
        `)
  }
  checkImages()
}

function checkImages(){
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
  let msnry = new Masonry( '.gallery', {
    itemSelector: '.item',
    columnWidth: '.item',
    gutter: 24
  });
}

function loadPost(item) {
  let post = $(item).data()
  let rawPost = allContent.filter( x  => x.permlink === post.permlink )[0]
  let allCopy = allUsers.map(x => Object.assign({}, x))
  let user = allCopy.filter( x  => x.name === rawPost.author )[0]
  console.log('META: ', user.json_metadata)

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
        <span class="overlay__author-username">@${user.name}</span>
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
  $('.overlay, .overlay__bg').addClass('overlay--active')

  finallyCommentsSystem.init()
  $('.overlay').scrollTop(0)
}

$('.overlay__bg').on('click', () => {
  $('body').removeClass('noscroll')
  $(window).scrollTop( lastTop );
  $('.overlay, .overlay__bg').removeClass('overlay--active')
})
