import { RaSticky, RaGrid } from '@bva/ui-vue';

export default {
  title: 'Components/Molecules/Sticky',
  component: RaSticky,
  // argTypes: {
  //   '@sticky:init': { action: 'sticky:init', table: { category: 'Events' } },
  //   '@sticky:active': { action: 'sticky:active', table: { category: 'Events' } },
  //   '@sticky:inactive': { action: 'sticky:inactive', table: { category: 'Events' } },
  //   '@sticky:frozen': { action: 'sticky:frozen', table: { category: 'Events' } },
  //   '@sticky:docked': { action: 'sticky:docked', table: { category: 'Events' } },
  //   '@sticky:undocked': { action: 'sticky:undocked', table: { category: 'Events' } },
  // }
};

const Template = (args, { argTypes }) => ({
  components: { RaSticky, RaGrid },
  props: Object.keys(argTypes),
  data() {
    return {
      stickyState: {},
    };
  },
  methods: {
    handleStateChange(evt) {
      const data = evt.detail.Stickie;

      //This causes an infinite loop crash.
      // this.stickyState = {
      //   initialized: !!data.initialized,
      //   enabled: !!data.isEnabled,
      //   active: !!data.isActive,
      //   frozen: !!data.isFrozen,
      //   docked: !!data.isDocked,
      //   stuckBottom: !!data.isStuckBottom,
      //   tall: !!data.isTall,
      //   scrollDirection: data.currentScrollDirection || '',
      // };

      if (typeof args[evt.type] === 'function') {
        args[evt.type](evt);
      }
    },
  },
  template: `
    <div style="marginTop: 4rem; height: 200rem;">
      <RaGrid columns="2">
        <RaGridItem>
          <div
            class="flex items-end justify-end"
            style="
              height: 100rem;
              border: 1px solid;
            "
          >
            <p v-if="contained">It'll stop scrolling here 👉</p>
            <p v-else>See you later 👋</p>
          </div>
        </RaGridItem>

        <RaGridItem>
          <p>This is a sticky element 👇</p>

          <RaSticky
            :provideContainer="false"
            enableDirectionUpdates
            v-bind="$props"
            @sticky:init="handleStateChange"
            @sticky:active="handleStateChange"
            @sticky:inactive="handleStateChange"
            @sticky:frozen="handleStateChange"
            @sticky:docked="handleStateChange"
            @sticky:undocked="handleStateChange"
            @sticky:stuckBottom="handleStateChange"
            @sticky:unstuckBottom="handleStateChange"
            @sticky:scrollDirectionUpdate="handleStateChange"
          >
            <div
              class="flex items-center bg-primary"
              :style="{height: stickyHeight}">
              <ul>
                <li
                  v-for="currentKey in Object.keys(stickyState)"
                  :key="currentKey"
                  :class="[{ 'text-warning': stickyState[currentKey] }]"
                >
                    {{currentKey}}: {{stickyState[currentKey].toString()}}
                </li>
              </ul>
            </div>
          </RaSticky>
        </RaGridItem>
      </RaGrid>
    </div>
    `,
});

export const Common = Template.bind({});
Common.args = {
  contained: true,
  offset: 20,
  stickyHeight: '20rem',
};

export const FreeScroll = Template.bind({});
FreeScroll.args = {
  ...Common.args,
  contained: false,
};

export const TallerThanViewport = Template.bind({});
TallerThanViewport.args = {
  ...Common.args,
  stickyHeight: '105vh',
};

export const ContentBefore = (args, { argTypes }) => ({
  components: { RaSticky },
  props: Object.keys(argTypes),
  template: `
    <div style="height: 80rem;">
      <div style="height: 4rem;" class="flex items-center justify-center bg-contrast text-highlight">
        A static top bar
      </div>

      <RaSticky v-bind="$props" style="flex: 1;">
        <div class="flex items-center justify-center bg-primary" style="height: 7rem;">
          I am a sticky.
        </div>
      </RaSticky>
    </div>
    `,
});

ContentBefore.args = {
  contained: false,
};
