<template>
  <tbody>
    <tr class="ra-table__row">
      <slot />
    </tr>
  </tbody>
</template>
<script>
export default {
  name: 'RaTableRow',
  inject: ['table'],
  mounted() {
    if (!this.$slots.default) return;
    this.table.updateColumnsCount(
      this.$slots.default.filter((node) => node.tag).length
    );
  },
};
</script>
