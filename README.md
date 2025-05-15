# Carbon

### [🏷️ Releases](https://github.com/presidiocreative/carbon/releases)&nbsp;&nbsp;&nbsp;⎯⎯&nbsp;&nbsp;&nbsp;[💬 Discussions](https://github.com/presidiocreative/carbon/issues)

## Installation

#### Clone the repo:

```
git clone git@github.com:presidiocreative/carbon.git
```

#### Install packages

```
yarn install
```

⚠️ The recommended node version for running carbon is Node v20.9.x

Our build process uses `fs.cp` to copy files from src to dist. This node library requires node `v20.9` or higher.
If you are running an older version of node, use `nvm install 20` then `nvm use 20` to upgrade to the latest stable node 20 build.


#### Setup Shopify CLI3

Install Shopify CLI with instructions [here](https://shopify.dev/themes/tools/cli/installation#macos)

⚠️ If you have version 3 of the CLI, check [here](https://shopify.dev/themes/tools/cli/migrate) for upgrade instructions



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
  store = "my-store.myshopify.com"
  ignore = [
    "config/settings_data.json", # To avoid resetting theme settings
    "sections/*.json",
    "templates/*.json",
    "templates/*.*.json",
    "templates/customers/.*.json"
  ]

[environments.bulldoze]
  theme = 123456789
  store = "my-store.myshopify.com"
```

Then, start your dev environment with `yarn start --env=my-env` or  `yarn start -e my-env`. This will effectively just call `shopify theme dev dist --store=my-store.myshopify.com --theme=12345`

Or, you can start multiple shopify processes for multiple dev environments with `yarn start --env=my-env,my-other-env`


## Deployment

### Deploying stores

You can To deploy to one or more stores for environment(s) listed in `shopify.theme.toml` simply use the `deploy` command with the `--env` option

`yarn deploy --env my-store1`

The env command has a shorthand version of `-e` and can accept a comma-separated list of entries from `shopify.theme.toml`:

`yarn deploy -e dev,qa,staging`

## Lighthouse

### Running lighthouse locally

Running the following command will deploy your development theme, run lighthouse on it, then open the report

`yarn lighthouse`

### Viewing Lighthouse CI Dashboard

Lighthouse is run against every pull request push and merge to master to track scores across time. View the Lighthouse Dashboard at https://invisible-lighthouse-server.herokuapp.com. Username is `abra` password is `cadabra`
