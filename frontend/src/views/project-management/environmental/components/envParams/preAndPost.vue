<template>
  <div class="h-full">
    <a-tabs v-model:active-key="activeTab" lazy-load class="no-content">
      <a-tab-pane v-for="item of tabList" :key="item.key" :title="item.label"></a-tab-pane>
    </a-tabs>
    <a-divider margin="0"></a-divider>
    <div v-if="activeTab === 'scenarioProcessorConfig'" class="h-[calc(100vh - 100px)] mt-4">
      <a-alert class="mb-4"> {{ t('project.environmental.sceneAlertDesc') }} </a-alert>
      <a-scrollbar
        :style="{
          overflow: 'auto',
          height: 'calc(100vh - 540px)',
        }"
      >
        <PreTab
          v-if="props.activeType === 'pre'"
          :show-associated-scene="showAssociatedScene"
          :show-pre-post-request="!showAssociatedScene"
          :active-tab="activeTab"
        />
        <PostTab
          v-if="props.activeType === 'post'"
          :show-associated-scene="showAssociatedScene"
          :show-pre-post-request="!showAssociatedScene"
          :active-tab="activeTab"
        />
      </a-scrollbar>
    </div>
    <div v-if="activeTab === 'requestProcessorConfig'" class="mt-4 h-full">
      <a-alert class="mb-4"> {{ t('project.environmental.requestAlertDesc') }} </a-alert>
      <PreTab
        v-if="props.activeType === 'pre'"
        :show-associated-scene="showAssociatedScene"
        :show-pre-post-request="!showAssociatedScene"
        :request-radio-text-props="requestPropsText"
        :active-tab="activeTab"
      />
      <PostTab
        v-if="props.activeType === 'post'"
        :show-associated-scene="showAssociatedScene"
        :show-pre-post-request="!showAssociatedScene"
        :request-radio-text-props="requestPropsText"
        :active-tab="activeTab"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';

  import PostTab from './PostTab.vue';
  import PreTab from './PreTab.vue';

  import { getEnvironment } from '@/api/modules/api-test/common';
  import { useI18n } from '@/hooks/useI18n';
  import useProjectEnvStore from '@/store/modules/setting/useProjectEnvStore';

  const store = useProjectEnvStore();

  const { t } = useI18n();

  const props = defineProps<{
    activeType: string;
  }>();

  const tabList = ref<{ key: string; label: string }[]>([
    {
      key: 'scenarioProcessorConfig',
      label: '场景',
    },
    {
      key: 'requestProcessorConfig',
      label: '请求',
    },
  ]);
  const activeTab = ref<string>('scenarioProcessorConfig');
  const showAssociatedScene = computed(() => {
    return activeTab.value === 'scenarioProcessorConfig';
  });

  const requestPropsText = computed(() => {
    if (activeTab.value === 'requestProcessorConfig') {
      return props.activeType === 'pre'
        ? {
            pre: t('project.environmental.preScriptBefore'),
            post: t('project.environmental.preScriptAfter'),
            preTip: t('project.environmental.http.preTextPreTip'),
            postTip: t('project.environmental.http.preTextPostTip'),
          }
        : {
            pre: t('project.environmental.postScriptBefore'),
            post: t('project.environmental.postScriptAfter'),
            preTip: t('project.environmental.http.postTextPreTip'),
            postTip: t('project.environmental.http.postTextPostTip'),
          };
    }
  });

  const currentEnvConfig = ref({});
  /** 向孙组件提供属性 */
  provide('currentEnvConfig', readonly(currentEnvConfig));

  onBeforeMount(() => {
    currentEnvConfig.value = store.currentEnvDetailInfo.config;
  });
</script>

<style scoped lang="less">
  .no-content {
    :deep(.arco-tabs-content) {
      padding-top: 0;
    }
  }
</style>