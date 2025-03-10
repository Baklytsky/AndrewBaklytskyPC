<template>
  <table class="ra-table">
    <slot />
  </table>
</template>
<script>
export default {
  name: 'RaTable',
  provide() {
    const table = {};
    Object.defineProperty(table, 'updateColumnsCount', {
      value: this.updateColumnsCount,
    });
    return { table };
  },
  methods: {
    updateColumnsCount(columnsCount) {
      this.$el.style.setProperty(
        '--_table-column-width',
        Math.ceil(columnsCount / 2)
      );
    },
  },
};
</script>
<style>
@import '@bva/ui-shared/styles/components/organisms/RaTable.css';
</style>
