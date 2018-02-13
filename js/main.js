
let query = { 'tag': 'photofeed', 'limit': 20 }
let converter = new showdown.Converter()

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
        <div class="item"><img class="item__image hidden" src="${image}"></div>
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
