# Headlands

### [🏷️ Releases](https://github.com/presidiocreative/headlands-internal/releases)&nbsp;&nbsp;&nbsp;⎯⎯&nbsp;&nbsp;&nbsp;[💬 Discussions](https://github.com/presidiocreative/headlands-internal/issues)

## Installation

#### Clone the repo:
SSH
```
git clone git@github.com:presidiocreative/headlands-internal.git
```

HTTPS
```
git clone https://github.com/presidiocreative/headlands-internal.git
```

#### Check your Node version
⚠️ The recommended version is Node v22 or higher (see `.nvmrc`)

Our build process uses `fs.cp` to copy files from src to dist, and the Shopify CLI requires a current LTS release. If you are running an older version of node, use `nvm install 22` then `nvm use 22` to upgrade to the latest stable Node 22 build.

#### Install packages

```
yarn install
```


#### Setup Shopify CLI 4

Install Shopify CLI with instructions [here](https://shopify.dev/themes/tools/cli/installation#macos)

⚠️ If you have an older version of the CLI, check [here](https://shopify.dev/themes/tools/cli/migrate) for upgrade instructions



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


## Troubleshooting

### Can't log into a store

If `shopify theme dev` / `yarn start` won't authorize you against a store ("You aren't authorized to edit this store" or similar), the CLI has likely cached an incorrect account session. If your email already matches the store owner's address but you are still getting blocked, force a clean link:

1. Log out completely from the terminal:

   ```
   shopify auth logout
   ```

2. Open your browser, navigate directly to your permanent store URL (e.g. `your-store.myshopify.com/admin`), and log in there first.
3. Return to the terminal and start the dev server using your raw `.myshopify.com` handle (avoid custom vanity domains):

   ```
   shopify theme dev --store=your-store.myshopify.com
   ```


## Deployment

### Deploying stores

You can To deploy to one or more stores for environment(s) listed in `shopify.theme.toml` simply use the `deploy` command with the `--env` option

`yarn deploy --env my-store1`

The env command has a shorthand version of `-e` and can accept a comma-separated list of entries from `shopify.theme.toml`:

`yarn deploy -e dev,qa,staging`
