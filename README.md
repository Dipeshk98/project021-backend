# Nextless.js backend for SaaS 🚀

Nextless.js backend code for the REST Api. The code comes up with a Todo application with CRUD operation: create, read, update and delete a Todo. So, it makes easier to understand the backend architecture and you can adapt easily to your needs. You can also accept payment right away with the provided Stripe Integration. You have access to the all code source if you need more customization or need to go further.

### Requirements

- Node.js and npm

### Getting started

Run the following command on your local environment after cloning the project:

```
cd my-project-name-backend
npm install
```

Before installing local dynamoDB, make sure you have openjdk 17.x.x or newer:

> :warning: Even if you have already Java installed on your computer, please make sure your Java isn't too old. Java is only used by the local and offline AWS dynamoDB. So, if your old Java version isn't compatible with the local DynamoDB, your all backend won't start correctly and you don't get any warning 😥

```
brew install java # Brew is only valid on Mac. Or, you can install it manually on the official Java website.

# At the end of installation, Brew indicates some instruction to install Java correctly, please follow them
```

You also need to install a local dynamodb:

```
npx sls dynamodb install
```

Then, you can run locally in development mode with live reload:

```
npm run dev
```

Open http://localhost:4000 with your favorite browser to see your project. You should get a `{"errors":"not_found"}`. It's genius error because the `index` isn't defined and it's normal.

If you want to test the backend without the front, you can use `Postman` but what I suggest instead is to use `humao.rest-client` VSCode extension. It helps to run HTTP request in your VSCode.

Located at `test/api.http`, it's a file where you can run requests directly in `humao.rest-client`. All supported requests are provided. So, you can test all the request directly in your VSCode.

### File structure, most important folder

```
.
├── README.md                               # README file
├── aws-resources                           # Additional AWS resources used by serverless.yml
├── db
│   └── seed.json                           # File used for DynamoDB seed
├── serverless.yml                          # Serverless configuration file
├── src
│   ├── controllers                         # Controller folder
│   │   └── index.ts
│   ├── error                               # Error folder
│   │   ├── ApiError.ts
│   │   ├── ErrorCode.ts
│   │   └── RequestError.ts                 # Express Handler for error
│   ├── handler.ts                          # Entrypoint for lambda
│   ├── middlewares                         # Express middleware
│   │   └── Validation.ts
│   ├── models                              # Database models
│   │   └── AbstractItem.ts                 # All database models are extended from AbstractItem
│   ├── routes                              # Express JS routes
│   ├── services                            # Service folder
│   │   └── index.ts
│   ├── types                               # Types for TypeScript
│   ├── utils                               # Utility folder
│   └── validations                         # Incoming request validator with Zod
└── test
    └── api.http                            # HTTP request example
```

### Customization

You can easily configure Nextless by making a search in the whole project with `FIXME:` for making quick customization.

You have access to the whole code source if you need further customization. The provided code is only example for you to start your SaaS products. The sky is the limit 🚀.

For your information, you don't need to customize the service name in `serverless.yml` file for one project. But, when you have multiple projects, it'll have name collision. So, you need to update the service name in `serverless.yml` file by choosing a new name instead `nextless`. And, don't forget to update `sst.json` file in Nextless Infra repository.

### Deploy to production

If you deploy for the first time, please checkout [this guide](https://github.com/Nextlessjs/Quick-Start/blob/main/PRODUCTION_DEPLOYMENT.md).

You can deploy to production with the following command:

```
npm run deploy-prod
```

(optional) You can try Seed.run for an automatic backend deployment integrated to your GitHub workflow.

### DynamoDB seed

By default, your backend application starts with empty data in DynamoDB. You can change this behavior by modifying the JSON file located at `db/seed.json`. Each time you run your backend application, your Dynamodb will be initialized by the seed data you have provided.

## Install dynamodb-admin (optional)

For better developer experience, you can install `dynamodb-admin`:

```
npm install -g dynamodb-admin
```

Then, you can run:

```
dynamodb-admin
```

Open http://localhost:8001 with your favorite browser and you can visually browse your data stored in your local DynamoDB.

### Things to know

`serverless-offline-plugin` display a red warning in the console `offline: [object Object]`. It's just a warning from [Serverless Offline Plugin](https://github.com/dherault/serverless-offline/blob/b39e8cf23592ad8bca568566e10c3db3469a951b/src/utils/getHttpApiCorsConfig.js). Hope it'll solve in the next release of `serverless-offline-plugin`.

### VSCode information (optional)

If you are VSCode users, you can have a better integration with VSCode by installing the suggested extension in `.vscode/extension.json`. The starter code comes up with Settings for a seamless integration with VSCode. The Debug configuration is also provided for frontend and backend debugging experience.

Pro tips: if you need a project wide type checking with TypeScript, you can run a build with <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> on Mac.

The debug configuration is also provided for VSCode. 1 debug configurations is provided:

| Name | Description |
| --- | ----------- |
| `Severless debug` | Launch Serverless in debug mode |

### Going further with third party tool (optional)

- Add Seed.run for automatic deployment integrated to your GitHub workflow.

For you information, Seed.run doesn't load `.env` files. You need to indicate the environment variable manually in Seed.run user interface, here how to do it: https://seed.run/docs/storing-secrets.html

- Add a better serverless monitoring and debugging tool like Lumigo. Or, any equivalent Dashbird, Epsagon, Tundra.
- Using Sentry isn't recommended for backend, there are a lot of overhead (written on Tuesday 31th August 2021).

### Contributions

Everyone is welcome to contribute to this project. Feel free to open an issue if you have question or found a bug.

---

Made with ♥ by [CreativeDesignsGuru](https://creativedesignsguru.com) [![Twitter](https://img.shields.io/twitter/url/https/twitter.com/cloudposse.svg?style=social&label=Follow%20%40Ixartz)](https://twitter.com/ixartz)
