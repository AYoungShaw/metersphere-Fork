<template>
  <div class="menu-item">
    <a-button
      class="arco-btn-outline--secondary mb-[4px]"
      :disabled="arrangeUpDisabled"
      type="outline"
      size="small"
      @click="execCommand('ArrangeUp')"
    >
      <template #icon>
        <icon-plus />
      </template>
    </a-button>
    {{ t('minder.menu.move.up') }}
  </div>
  <div class="menu-item">
    <a-button
      class="arco-btn-outline--secondary mb-[4px]"
      :disabled="arrangeDownDisabled"
      type="outline"
      size="small"
      @click="execCommand('ArrangeDown')"
    >
      <template #icon>
        <icon-plus />
      </template>
    </a-button>
    {{ t('minder.menu.move.down') }}
  </div>
</template>

<script lang="ts" name="moveBox" setup>
  import { nextTick, onMounted, reactive, ref } from 'vue';

  import { useI18n } from '@/hooks/useI18n';

  import { isDisableNode } from '../../script/tool/utils';

  const { t } = useI18n();

  const props = defineProps<{
    moveEnable: boolean;
    moveConfirm: any;
  }>();

  let minder = reactive<any>({});
  const arrangeUpDisabled = ref(true);
  const arrangeDownDisabled = ref(true);

  function checkDisabled() {
    try {
      if (Object.keys(minder).length === 0) return false;
    } catch (e) {
      // 如果window的还没挂载minder，先捕捉undefined异常
      return false;
    }
    const node = minder.getSelectedNode();
    if (!props.moveEnable || !node || node.parent === null || isDisableNode(minder)) {
      arrangeUpDisabled.value = true;
      arrangeDownDisabled.value = true;
      return;
    }
    if (window.minder.queryCommandState) {
      arrangeUpDisabled.value = window.minder.queryCommandState('ArrangeUp') === -1;
      arrangeDownDisabled.value = window.minder.queryCommandState('ArrangeDown') === -1;
    }
  }

  onMounted(() => {
    nextTick(() => {
      minder = window.minder;
      minder.on('selectionchange', () => {
        checkDisabled();
      });
    });
  });

  function execCommand(command: string) {
    if (window.minder.queryCommandState(command) !== -1) window.minder.execCommand(command);
  }
</script>
