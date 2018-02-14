
let query = { 'tag': 'photofeed', 'limit': 27 }
let converter = new showdown.Converter()

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
      image = image ? image.src : json.image[0]

      $('.gallery').append(`
        <div class="item" data-url="${post.category}/@${post.author}/${post.permlink}">
          <img class="item__image hidden" src="https://steemitimages.com/480x768/${image}">
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
  images.removeClass('hidden')
  let msnry = new Masonry( '.gallery', {
    itemSelector: '.item',
    columnWidth: '.item',
    gutter: 24
  });
}

function loadPost(item) {
  let post = $(item).data()


  let template = `
  <section class="finally-comments" data-id="https://steemit.com/${post.url}" data-reputation="true" data-values="true" data-profile="true"></section>
  `
  $('.overlay').empty()
  $('.overlay').append(template)
  $('.overlay').addClass('overlay--active')
  finallyCommentsSystem.init()
}
