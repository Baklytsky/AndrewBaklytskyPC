import wrap from '../util/wrap';

function wrapElements(container) {
  // Target tables to make them scrollable
  const tableSelectors = 'table';
  const tables = container.querySelectorAll(tableSelectors);
  tables.forEach((table) => {
    wrap(table, 'table-wrapper');
  });
}

export default wrapElements;
