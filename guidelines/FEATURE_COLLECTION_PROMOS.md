# Collection Featured Promos - Metaobjects Setup

This document explains how to set up and use metaobjects for collection featured promos, allowing you to customize which promos appear for each collection.

## Overview

The collection featured promo feature has been converted from section blocks to metaobjects. This allows you to:
- Create different promos for different collections
- Manage promos independently from section settings
- Reuse promo configurations across multiple collections if needed

## Metaobject Type Setup

1. **Create a Metaobject Type** in Shopify Admin:
   - Go to Settings > Custom data > Metaobjects
   - Click "Add definition"
   - Name it `collection_featured_promo` (or your custom name)

2. **Add the following fields** to your metaobject type:

   ### Required Fields:
   - **Collection** (type: `collection_reference`)
     - Key: `collection`
     - Label: "Collection"
     - Description: "The collection this promo applies to"

   - **Position** (type: `number_integer`)
     - Key: `position`
     - Label: "Position"
     - Description: "Position in the product grid (1-24)"
     - Default: 1

   ### Media Fields (at least one required):
   - **Image** (type: `file_reference` - image)
     - Key: `image`
     - Label: "Image"
     - Description: "Featured image (1400 x 1400px .jpg recommended)"

   - **Video** (type: `file_reference` - video)
     - Key: `video`
     - Label: "Video"
     - Description: "Featured video"

   ### Content Fields:
   - **Heading** (type: `single_line_text_field`)
     - Key: `heading`
     - Label: "Heading"
     - Default: "Featured link"

   - **Text** (type: `multi_line_text_field`)
     - Key: `text`
     - Label: "Text"
     - Default: "Promote products or collections"

   - **Button Text** (type: `single_line_text_field`)
     - Key: `button_text`
     - Label: "Button Label"
     - Default: "Learn more"

   - **Button Link** (type: `link`)
     - Key: `button_link`
     - Label: "Button Link"

   ### Button Style Fields:
   - **Button Type** (type: `single_line_text_field`)
     - Key: `button_type`
     - Label: "Button Color"
     - Default: "btn--primary"
     - Options: "btn--black", "btn--white", "btn--primary", "btn--secondary"

   - **Button Size** (type: `single_line_text_field`)
     - Key: `button_size`
     - Label: "Button Size"
     - Default: ""
     - Options: "btn--small", "", "btn--large"

   - **Button Style** (type: `single_line_text_field`)
     - Key: `button_style`
     - Label: "Button Style"
     - Default: "btn--outline"
     - Options: "btn--solid", "btn--outline", "btn--text"

   - **Show Arrow** (type: `boolean`)
     - Key: `show_arrow`
     - Label: "Show button arrow"
     - Default: false

   ### Typography Fields:
   - **Heading Font Size** (type: `single_line_text_field`)
     - Key: `heading_font_size`
     - Label: "Heading size"
     - Default: "heading-large"
     - Options: "heading-mini", "heading-x-small", "heading-small", "heading-medium", "heading-large", "heading-x-large"

   - **Heading Tag** (type: `single_line_text_field`)
     - Key: `heading_tag`
     - Label: "Heading SEO tag"
     - Default: "automatic"
     - Options: "automatic", "h1", "h2", "h3", "h4", "h5", "h6"

   ### Display Fields:
   - **Align with Product Images** (type: `boolean`)
     - Key: `align_with_product_images`
     - Label: "Align with product images"
     - Default: false

   ### Color Fields:
   - **Text Color** (type: `color`)
     - Key: `color_text`
     - Label: "Text Color"
     - Default: "#ffffff"

   - **Overlay Color** (type: `color`)
     - Key: `color_overlay`
     - Label: "Overlay Color"
     - Default: "#222222"

   - **Overlay Opacity** (type: `number_decimal`)
     - Key: `overlay_opacity`
     - Label: "Overlay Opacity"
     - Default: 10
     - Min: 0, Max: 100
     - Description: "Percentage (0-100)"

3. **Enable Storefront Access**:
   - Make sure "Storefront access" is enabled for this metaobject type
   - This allows the theme to access the metaobjects

## Usage

1. **Create Metaobject Entries**:
   - Go to Content > Metaobjects > [Your Metaobject Type]
   - Click "Add entry"
   - Select the collection this promo applies to
   - Fill in the position, media, and content fields
   - Save

2. **Configure Section Settings**:
   - In the Collection section settings, find "Featured promos"
   - Enter your metaobject type name (default: `collection_featured_promo`)
   - The section will automatically display promos that match the current collection

## Backward Compatibility

The theme maintains backward compatibility with the old block-based system. If no metaobjects are found for a collection, it will fall back to using section blocks (if configured).

## Notes

- Multiple promos can be created for the same collection
- Promos are sorted by position, then by creation order
- Only promos matching the current collection will be displayed
- The metaobject type name can be customized in section settings if you use a different name

