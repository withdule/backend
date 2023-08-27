<div align="center">

# Dule API
A Typescript express api for [Dule](https://github.com/withdule/dule)

</div>

## Project status
- [x] Authentication
- [ ] Notes 
- [ ] Reminders
- [ ] Notes
- [ ] Tasks
- [ ] Tasklists

## Documentation

### Configuration
.env
```dotenv
PORT=5000
DATABASE_URL=http://admin:password@localhost:5984 # See [Docker](#docker) to deploy CouchDB database
SECRET=random string
```

### Start and build

Dev mode, uses `ts-node`
```shell
npm run dev
```

Build typescript project (`build:watch` for watch changes and automatically rebuild)
```shell
npm run build
```

Start in production mode
```shell
npm start
```

Build and start
```shell
npm run buildandstart
```

### Docker

[//]: # (TODO)
