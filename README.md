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

Then, you can run locally in development mode with live reload:

```
npm run dev
```

Open http://localhost:4000 with your favorite browser to see your project. You should get a `{"errors":"not_found"}`.

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

### Deploy to production

Before deploying to production, you need to generate `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` from your AWS account by following this tutorial: https://www.serverless.com/framework/docs/providers/aws/guide/credentials/#creating-aws-access-keys.

After generating your **API key** and **Secret**, you need to set up in your local machine with aws-cli: https://www.serverless.com/framework/docs/providers/aws/guide/credentials/#setup-with-the-aws-cli. You don't need to set up a `profile` if you have only one account or one AWS IAM user.

You can deploy to production with the following command:

```
npm run deploy-prod
```

### DynamoDB seed

By default, your backend application starts with empty data in DynamoDB. You can change this behavior by modifying the JSON file located at `db/seed.json`. Each time you run your backend application, your Dynamodb will be initialized by the seed data you have provided.

### Things to know

`serverless-offline-plugin` display a red warning in the console `offline: [object Object]`. It's just a warning from [Serverless Offline Plugin](https://github.com/dherault/serverless-offline/blob/b39e8cf23592ad8bca568566e10c3db3469a951b/src/utils/getHttpApiCorsConfig.js). Hope it'll solve in the next release of `serverless-offline-plugin`.

### VSCode information (optional)

If you are VSCode users, you can have a better integration with VSCode by installing the suggested extension in `.vscode/extension.json`. The starter code comes up with Settings for a seamless integration with VSCode. The Debug configuration is also provided for frontend and backend debugging experience.

Pro tips: if you need a project wide type checking with TypeScript, you can run a build with <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>B</kbd> on Mac.

The debug configuration is also provided for VSCode. 1 debug configurations is provided:

| Name | Description |
| --- | ----------- |
| `Severless debug` | Launch Serverless in debug mode |

### Contributions

Everyone is welcome to contribute to this project. Feel free to open an issue if you have question or found a bug.

---

Made with ♥ by [CreativeDesignsGuru](https://creativedesignsguru.com) [![Twitter](https://img.shields.io/twitter/url/https/twitter.com/cloudposse.svg?style=social&label=Follow%20%40Ixartz)](https://twitter.com/ixartz)
