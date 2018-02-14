
let query = { 'tag': 'photofeed', 'limit': 10 }
let converter = new showdown.Converter()
let allContent = []

$('.gallery').on('click', '.item', (e) => {
    loadPost(e.currentTarget)
})

steem.api.getDiscussionsByCreated(query, (err, result) => {
    if (err === null) {
        displayImages(result)
    } else {
        console.log(err);
    }
});

function displayImages(result){
  for (let i = 0; i < result.length ; i++) {
      let post = result[i];
      let json = JSON.parse(post.json_metadata)

      let placeholder = document.createElement('div');
      placeholder.innerHTML = converter.makeHtml(post.body);
      let image = placeholder.querySelector('img') ;
      post.body = post.body.replace('<p><br></p>', '')
      post.body = post.body.replace('<p></p>', '')

      if (image == false && json.image[0] != undefined){

        json.image.forEach((url) => {
          post.body = post.body.replace(url, '<img src="' + url + '">')
        })
      }
      placeholder.innerHTML = converter.makeHtml(post.body);
      image = placeholder.querySelector('img') ;

      console.log(image)

      image = image ? image.src : json.image[0]
      console.log(image)


      allContent.push(post);

      $('.gallery').append(`
        <div class="item hidden" data-url="${post.category}/@${post.author}/${post.permlink}" data-permlink="${ post.permlink }">
          <img class="item__image " src="https://steemitimages.com/480x768/${image}">
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
  console.log('SELECTED permlink: ', post.permlink)
  console.log('all: ', allContent)
  allContent.map( x => {
    console.log('permlink: ', x.permlink)
  })

  let rawPost = allContent.filter( x  => x.permlink === post.permlink )[0]

  let html = converter.makeHtml(rawPost.body)
  html = html.replace('<p><br></p>', '')
  html = html.replace('<p></p>', '')

  $('body').addClass('noscroll')
  $('.overlay__content').empty()
  $('.overlay__content').append(`<h1 class="title">${rawPost.title}</h1>`)
  $('.overlay__content').append(html)



  let template = `
  <section class="finally-comments" data-id="https://steemit.com/${post.url}" data-reputation="true" data-values="true" data-profile="true"></section>
  `
  $('.overlay__content').append(template)
  $('.overlay, .overlay__bg').addClass('overlay--active')

  finallyCommentsSystem.init()
}
$('.overlay__bg').on('click', () => {
  $('body').removeClass('noscroll')

  $('.overlay, .overlay__bg').removeClass('overlay--active')

})
