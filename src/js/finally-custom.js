
const frame = require('iframe-resizer')

let finallyCommentsSystem = {
  getPartsFromLink: (url) => {
    let lastChar = url.substr(url.length -1);
    if (lastChar === '/')
    url = url.slice(0, -1);

    let parts = url.split('/')

    return {
      permlink: parts.pop(),
      author: parts.pop(),
      category: parts.pop()
    }
  },
  setupIframe: () => {
    let container = document.querySelector('.finally-comments')
    let url = container.dataset.id
    let urlParts = finallyCommentsSystem.getPartsFromLink(url)
    let finallyUrl = `https://finallycomments.com/thread/${urlParts.category}/${urlParts.author}/${urlParts.permlink}`
    let iframe = document.createElement('iframe', { scrolling: 'no' });
    iframe.src = finallyUrl;
    iframe.width = '100%';
    iframe.style = 'border: none;'
    iframe.dataset['reputation'] = container.dataset.reputation
    iframe.dataset['profile'] = container.dataset.profile
    iframe.dataset['values'] = container.dataset.values
    container.appendChild(iframe)

  }
}

window.addEventListener('message', receiveMessage, false);

function receiveMessage(event)
{
  if (event.data.message == 'sign-in'){
    if (event.origin !== 'https://finallycomments.com' )
      return;
    $('.finally-comments iframe').css('height', 600)
  }

  if (event.data.message == 'new-comment'){
    if (event.origin !== 'https://finallycomments.com' )
      return;


    let frameOffset = getDistanceFromTop(document.querySelector('.finally-comments'))
    let frameHeight = document.querySelector('.finally-comments').getBoundingClientRect().height;

    if ( event.data.depth === undefined || event.data.depth === 0 ){
      document.documentElement.scrollTop = ( frameOffset +  frameHeight )
    } else {
      document.documentElement.scrollTop = ( event.data.offset +  frameOffset - 300)
    }

  }
}

function getDistanceFromTop(element) {
    var yPos = 0;

    while(element) {
        yPos += (element.offsetTop);
        element = element.offsetParent;
    }

    return yPos;
}

module.exports.init = () => {
    finallyCommentsSystem.setupIframe();
    frame.iframeResizer( {}, '.finally-comments iframe' );
}
