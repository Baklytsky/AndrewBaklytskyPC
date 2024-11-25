import {register} from '../vendor/theme-scripts/theme-sections';
import {RadioSwatch, GridSwatch} from '../features/swatch';
import {ProductSiblings} from '../features/siblings';
import {HoverImages} from '../features/hover-images';
import tabs from '../features/tabs';
import {QuickAddProduct} from '../features/quick-add-product';

register('product-grid', [tabs]);

if (!customElements.get('quick-add-product')) {
  customElements.define('quick-add-product', QuickAddProduct);
}

if (!customElements.get('radio-swatch')) {
  customElements.define('radio-swatch', RadioSwatch);
}

if (!customElements.get('grid-swatch')) {
  customElements.define('grid-swatch', GridSwatch);
}

if (!customElements.get('product-siblings')) {
  customElements.define('product-siblings', ProductSiblings);
}

if (!customElements.get('hover-images')) {
  customElements.define('hover-images', HoverImages);
}
