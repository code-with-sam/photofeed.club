
let query = { 'tag': 'photofeed', 'limit': 14 }
let converter = new showdown.Converter(
    { tables: true }
)
let allContent = []

$('.gallery').on('click', '.item', (e) => {
    loadPost(e.currentTarget)
})

getTrending()

function getTrending(){

  steem.api.getDiscussionsByTrending(query, (err, result) => {
    if (err === null) {
      displayImages(result)
    } else {
      console.log(err);
    }
  });
}

function getLatest(){

  steem.api.getDiscussionsByCreated(query, (err, result) => {
    if (err === null) {
      displayImages(result)
    } else {
      console.log(err);
    }
  });
}

function displayImages(result){
  for (let i = 0; i < result.length ; i++) {
      let post = result[i];
      console.log(post)

      var urlRegex = /(https?:\/\/[^\s]+)/g;

      post.body = post.body.replace(urlRegex, (url) => {
        console.log('matches: ', url)

        let last = url.slice(-3)

        if(last === 'jpg' || last === 'png' || last === 'jpe' || last === 'gif')  {
          console.log('last char is valid: ', url)
                  console.log('matches: ', url)
          return '<img src="' + url + '">';
        } else {
          return url
        }
      })
      let placeholder = document.createElement('div');
      placeholder.innerHTML = converter.makeHtml(post.body)
      let image = placeholder.querySelector('img') ;

      image = image.src

      allContent.push(post);

      $('.gallery').append(`
        <div class="item " data-url="${post.category}/@${post.author}/${post.permlink}" data-permlink="${ post.permlink }">
          <img class="item__image " src="https://steemitimages.com/480x768/${image}" onerror="">
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

  let html = converter.makeHtml(rawPost.body)
  html = html.replace('<p><br></p>', '')
  html = html.replace('<p></p>', '')

  lastTop = $(window).scrollTop();

  $('body').addClass( 'noscroll' ).css( { top: -lastTop } )

  $('.overlay__content').empty()
  $('.overlay__content').append(`<h1 class="title">${rawPost.title}</h1>`)
  $('.overlay__content').append(html)

  let template = `
  <section class="finally-comments" data-id="https://steemit.com/${post.url}" data-reputation="true" data-values="true" data-profile="true"></section>
  `
  $('.overlay__content').append(template)
  $('.overlay, .overlay__bg').addClass('overlay--active')

  finallyCommentsSystem.init()
  $('.overlay').scrollTop(0)
}

$('.overlay__bg').on('click', () => {
  $('body').removeClass('noscroll')
  $(window).scrollTop( lastTop );
  $('.overlay, .overlay__bg').removeClass('overlay--active')
})
