# Palo Alto Theme

### [🏷️ Releases](https://github.com/invisiblethemes/Palo-Alto/projects?type=classic)&nbsp;&nbsp;&nbsp;⎯⎯&nbsp;&nbsp;&nbsp;[💬 Discussions](https://github.com/invisiblethemes/Palo-Alto/discussions)

Demos: [Vibrant](https://palo-alto-theme-vibrant.myshopify.com/) // [Palo Alto / Backpacks](https://palo-alto-theme.myshopify.com/) // [Stanford](https://palo-alto-theme-stanford.myshopify.com/)

### Dev stores:
- [paloalto-theme](https://palo-alto-theme.myshopify.com/)
- [paloalto-dev](https://palo-alto-dev.myshopify.com)

## Installation

#### Clone the repo:

```
git clone git@github.com:invisiblethemes/Palo-Alto.git
```

#### Install packages

```
yarn install
```

⚠️ The recommended node version for running Palo Alto is Node v19.4.x

Our build process uses `fs.cp` to copy files from src to dist. This node library requires node `v19.1` or higher.
If you are running an older version of node, use `nvm install 19` then `nvm use 19` to upgrade to the latest stable node 14 build.


#### Setup Shopify CLI3

Install Shopify CLI with instructions [here](https://shopify.dev/themes/tools/cli/installation#macos)

⚠️ If you have version 2 of the CLI, check [here](https://shopify.dev/themes/tools/cli/migrate) for upgrade instructions



## Development

Start dev env:

```
yarn start
```

This will:
- Build the app using Gulp/Rollup
- Start `shopify theme dev` watching the `dist` folder
- Ask you to login to the specified store
- Open a browser window pointed to theme URL
- Watch for changes and rebuild which will trigger shopify CLI to push changes

### Copying environment settings

To copy preset settings files in `environments/**` to a given store, use the `--settings` flag:

```
yarn start -s=chaos
```

This will copy the settings in `environments/chaos` to the dist folder before pushing

### Changing environments

During development, it's useful to be able to quickly switch between different combos of themes, stores and settings.

To setup different environments create a `shopify.theme.toml` file and add entries like

```toml
[my-env-name]
  theme = 1475471234567890455804
  store = "my-store.myshopify.com"
  ignore = [ "some-file.json" ]
```


```toml
[environments.development]
  theme = 123456789
  store = "pa-qa-chaos.myshopify.com"
  ignore = [
    "config/settings_data.json", # To avoid resetting theme settings
    "sections/*.json",
    "templates/*.json",
    "templates/*.*.json",
    "templates/customers/.*.json"
  ]

[environments.templates]
  theme = 123456789
  store = "pa-qa-chaos.myshopify.com"
  ignore = ["config/settings_data.json"]

[environments.bulldoze]
  theme = 123456789
  store = "pa-qa-chaos.myshopify.com"

[environments.e2e]
  store = "pa-qa-spec.myshopify.com"
```

Then, start your dev environment with `yarn start --env=my-env` or  `yarn start -e my-env`. This will effectively just call `shopify theme dev dist --store=my-store.myshopify.com --theme=12345`

Or, you can start multiple shopify processes for multiple dev environments with `yarn start --env=my-env,my-other-env`

## Deployment

### Deploying stores

You can To deploy to one or more stores for environment(s) listed in `shopify.theme.toml` simply use the `deploy` command with the `--env` option

`yarn deploy --env my-store1`

he env command has a shorthand version of `-e` and can accept a comma-separated list of entries from `shopify.theme.toml`:

`yarn deploy -e dev,qa,staging`

### Deploying demo stores

When we deploy to a Shopify Theme Store demo, we need to add `<meta name="robots" content="noindex, nofollow">` to the head. This is tedious to add manually. We must add this line of code to prevent the demo stores from being indexed by Google and other search engines.

To make this Shopify requirement easy, our build process has a special command that will add "noindex/nofollow" to the head. You can turn it on by adding `--index=false` to the deploy command.

`yarn deploy -e my-store1 --no-index`

A command to deploy to all the demos might look something like this:
```
"NODE_ENV=production gulp deploy --index=false --env clothing-demo,skin-demo,shoes-demo,swim-demo",
```

🚨 Never use the `--index=false` flag on a merchant store. This command exists strictly for Shopify Theme Store demo stores. This line of code would *destroy* the SEO of a merchant store.


## Partials

Our build process sues Liquid JS to combine files locally.

Use a folder called `partials` in your local dev environment.

Use the tag `[% render 'partials/product-form' %]`


## Tests

### E2E Tests

Note: Make sure you have been added to the `pa-qa-spec.myshopify.com` store

Integration testing is done with [Cypress](https://www.cypress.io/)

Just run the following:

```
yarn test:e2e
```

That will start the theme server then start cypress. Cypress should now open and you can test stuff!

## Lighthouse

### Running lighthouse locally

Running the following command will deploy your development theme, run lighthouse on it, then open the report

`yarn lighthouse`

### Viewing Lighthouse CI Dashboard

Lighthouse is run against every pull request push and merge to master to track scores across time. View the Lighthouse Dashboard at https://invisible-lighthouse-server.herokuapp.com. Username is `abra` password is `cadabra`
