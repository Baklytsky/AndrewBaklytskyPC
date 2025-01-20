## Usage
**Node.js version 14.0.0 or higher**

## Install packages

```bash
npm install
```

### Add and configure your config.yml file. You can copy the example from the file [config.example.yml](./config.example.yml)
```yaml
development:
  password: XXXXXXXXXXXXXX
  theme_id: XXXXXXXXXXXXXX
  store: XXXXXXXXXXXXXX.myshopify.com
  preview_url: XXXXXXXXXXXXXX.shopifypreview.com <= [NOT REQUIRED]
  ignore_files:
    - config/settings_data.json
```

## Basic commands

Basic commands for work with your theme:

`gulp watch` - Build and watch files

`gulp build` - Build files

`gulp deploy` - Deploy and build files

`theme deploy` - Deploy files

`theme download` - Download files

`theme download config/settings_data.json --no-ignore` - Download theme settings


## SCSS naming

There are 2 types of scss files:

* Default `name.scss` - files of this type will be compiled as separate files in the `/asets` folder.
* Partials `_name.scss` - this type of scss files will not compile as a separate file. It is used as part of the code that will be imported into the main files.


