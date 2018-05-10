const steem = require('steem')
const db = require('./modules/db')
const _ = require('lodash')
const INTERVAL = 1000 * 60 * 60

let config = require('./config');
const databaseURL = `mongodb://${config.db.user}:${config.db.password}@ds119150.mlab.com:19150/photofeed2`;

// db.get().db('photofeed2').grantRolesToUser(
//     "photofeed",
//     [
//       { role: "read", db: "photofeed2" }
//     ]
// )

db.connect(databaseURL, (err) => {
   if (err) {
     console.log('Unable to connect to Mongo.')
     process.exit(1)
   } else {
     console.log('Connected to photofeed Datbase...')
   }
 })

function getPhotofeedPosts(username){
  return new Promise(function(resolve, reject) {
    let query = { 'tag':  username, 'limit': 100 }
    steem.api.getDiscussionsByBlog(query, (err, result) => {
      result = result.filter(post => {
        let tags = JSON.parse(post.json_metadata).tags
        if( tags.indexOf('photofeed') > -1 || post.parent_permlink === 'photofeed') return post
      })
      resolve(result)
    })
  });
}

function getPhotoFeedBlogEntries(){
  return new Promise(function(resolve, reject) {
    let a = steem.api.getBlogEntriesAsync('photofeed', 1000, 500)
    let b = steem.api.getBlogEntriesAsync('photofeed', 500, 500)
    Promise.all([a,b]).then(data => resolve(data))
  });
}

function processAllAuthorData(uniqueAuthors, numberOfFeaturedPosts){
  return new Promise(function(resolve, reject) {
    steem.api.getAccountsAsync(uniqueAuthors).then(data => {
      console.log('RAW STEEM ACCOUNT DATA: ', data)
      data = data.map(user => {
        let json;
        try {
          json = JSON.parse(user.json_metadata).profile
        } catch(e){console.log(e)}

        return {
          username: user.name,
          avatar: json ? json.profile_image : '',
          featured: numberOfFeaturedPosts[user.name]
        }
      })
      console.log(data)
      resolve(data)
    })
  });
}

function storeInitialData(data){
  console.log('DATA from process', data)
  for (var i = 0; i < data.length; i++) {
    db.get().db('photofeed2').collection('photographers').insert(data[i], (error, response) => {
      if(error || response == null) { console.log(error) }
      else { console.log(response) }
    })
  }
}

getPhotoFeedBlogTotals().then(data => {
  // let uniqueBlogEntries = _.unionBy(data[0], data[1], 'permlink');
  console.log('Unique Photofeed Blog Entries: ', uniqueBlogEntries)

  let usernames = data.map(post => post.author)
  let numberOfFeaturedPosts = _.countBy(usernames);
  console.log('Author feature count: ', numberOfFeaturedPosts)

  let uniqueAuthors = [...new Set(usernames)]
  console.log('Unique Authors: ', uniqueAuthors)

  // let authorPhotofeedPosts = uniqueAuthors.map(author => getPhotofeedPosts(author))
  // console.log('Authors Photofeed Posts Promises: ', authorPhotofeedPosts)
  //
  // Promise.all(authorPhotofeedPosts).then(data => {
  //   let photofeedPosts = data.map( (posts, i) => {
  //     return { author: uniqueAuthors[i], count: posts.length }
  //   })
  //   console.log('Authors Photodeed Posts Results: ', photofeedPosts)
  //
    processAllAuthorData(uniqueAuthors, numberOfFeaturedPosts)
      .then(data => storeInitialData(data))
  // })

})



function getPhotoFeedBlogTotals() {
  return new Promise(function(resolve, reject) {
    db.get().db('photofeed2').collection('posts').find().toArray((error, response) => {
      if(error || response == null) console.log(error)
      resolve(response)
    })
  });
}

function addPhotoFeedPosts(){
  getPhotoFeedBlogEntries().then(data => {
    let uniqueBlogEntries = _.unionBy(data[0], data[1], 'permlink');
    console.log('ADDING LATEST POSTS')
    for (var i = 0; i < uniqueBlogEntries.length; i++) {
      db.get().db('photofeed2').collection('posts').update({entry_id: uniqueBlogEntries[i].entry_id } ,uniqueBlogEntries[i], { upsert: true }, (error, response) => {
        if(error || response == null) console.log(error)
      })
    }

  })
}

function checkForLatestFeaturedPhotographers(){
  setInterval(addPhotoFeedPosts, INTERVAL)
}

checkForLatestFeaturedPhotographers

// setTimeout(getPhotoFeedBlogTotals, 3000)
