# Photofeed.club

## What is Photofeed
> PhotoFeed is a project spear-headed by [@jrue](https://steemit.com/@jrue), [@aweber](https://steemit.com/@aweber), [@yumyumseth](https://steemit.com/@yumyumseth) and [@cryptoctopus](https://steemit.com/@cryptoctopus) that aims to improve the experience of those who want to see beautiful professional photography on steemit.com.

## Aims For This Project
- support the #photofeed community by
- making the photo viewing experience better
- make it easier for photofeed curators to find great photographs
- showcase the trending photographs to highlight the growing community

## Development
This project is an Express.js app

### Config
Photofeed uses a database to store alest featured photographers

create a database at https://mlab.com/databases/
create a user for your new database
create a .env file at the project root and enter the details below
```
SESSION_SECRET=supersecretstring
PHOTOFEED_DB_USER=dbuser
PHOTOFEED_DB_PASSWORD=sbpass
```
update `databaseUrl` in `bin/www` with the url to your databse on mlab

### Compile SCSS & js via parcel
```npm install -g parcel-bundler```

```npm run dev``` - to watch for changes in src/ folder
```npm run build``` - builds for prod


- navigate to http://localhost:3000 in your browser

## Future Ideas
- read directly form database not blockchain API
- Submit Directly from photofeed.club
- Search by tags
- FAQ for visitors non familiar with the Steem
- Maintain own database for better speed & stability
- friendly SAP framework, suggestions?
- filters, ranking, there are far more possibilities because this is a custom system

Contributions are welcome.
