#!/usr/bin/env node

/*
 * 查询 github 排名
 *
 * node index.js --keyword yourname --location hangzhou
 */

let request = require('request')

let options = {
  uri: 'https://api.github.com/search/users',
  headers: {
    'User-Agent': 'github-rank-query'
  },
  qs: {
    q: '',
    per_page: 100,
    page: 1
  }
}

function doRequest(option, callback) {
  let params = []
  let {language, location, keyword, repos} = option

  if (language) {
    params.push(`language:${language}`)
  }

  if (location) {
    params.push(`location:${location}`)
  }

  if (repos) {
    params.push(`repos:${repos}`)
  }

  options.qs.q = params.join(' ')

  console.log(options.qs.q)

  request
    .get(options, (err, resp, body) => {
      body = JSON.parse(body)

      if (resp.statusCode !== 200) {
        callback(1, body) // error found
        return
      }

      let l = body.items.length
      let rank = 0
      for (let i = 0; i<l ; i++) {
        let item = body.items[i]
        if (item.login === keyword) {
          rank = i + 1
          // data found
          callback(0, body, rank + options.qs.per_page * (options.qs.page - 1))
          return
        }
      }

      if (l < options.qs.per_page) {
        // Not Found
        callback(-2, body)
      } else {
        // this page not found
        callback(-1, body)
      }

    })
}

function main(option) {
  console.log(`Searching page ${options.qs.page}...`)
  doRequest(option, (err, body, rank) => {
    switch (err) {
      case 1:
        console.log('Error found!', body)
        break
      case -1:
        if (body.items.length <= options.qs.per_page) {
          options.qs.page++
          main(option)
        }
        break
      case -2:
        console.log(`${option.keyword} is Not Found!`)
        break
      default:
        console.log(`${option.keyword}'s rank is ${rank}`)
        break
    }
  })
}

main({
  keyword: 'lpgray',
  location: 'hangzhou',
  language: 'javascript',
  repos: '>10'
})
