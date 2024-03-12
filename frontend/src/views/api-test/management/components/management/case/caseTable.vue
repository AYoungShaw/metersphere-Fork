<template>
  <div class="p-[16px_22px]">
    <div class="mb-[16px] flex items-center gap-[8px]">
      <a-input-search
        v-model:model-value="keyword"
        :placeholder="t('apiTestManagement.searchPlaceholder')"
        allow-clear
        class="mr-[8px] w-[240px]"
        @search="loadCaseList"
        @press-enter="loadCaseList"
      />
      <a-button type="outline" class="arco-btn-outline--secondary !p-[8px]" @click="loadCaseList">
        <template #icon>
          <icon-refresh class="text-[var(--color-text-4)]" />
        </template>
      </a-button>
    </div>
    <ms-base-table
      v-bind="propsRes"
      :action-config="batchActions"
      :first-column-width="44"
      no-disable
      filter-icon-align-left
      v-on="propsEvent"
      @selected-change="handleTableSelect"
      @batch-action="handleTableBatch"
      @drag-change="handleDragChange"
    >
      <template #num="{ record }">
        <MsButton type="text">{{ record.num }}</MsButton>
      </template>
      <template #caseLevel="{ record }">
        <a-select
          v-model:model-value="record.priority"
          :placeholder="t('common.pleaseSelect')"
          class="param-input w-full"
          @change="() => handleCaseLevelChange(record)"
        >
          <template #label>
            <span class="text-[var(--color-text-2)]"> <caseLevel :case-level="record.priority" /></span>
          </template>
          <a-option v-for="item of caseLevelList" :key="item.value" :value="item.value">
            <caseLevel :case-level="item.text" />
          </a-option>
        </a-select>
      </template>
      <template #caseLevelFilter="{ columnConfig }">
        <a-trigger v-model:popup-visible="caseFilterVisible" trigger="click" @popup-visible-change="handleFilterHidden">
          <MsButton type="text" class="arco-btn-text--secondary ml-[10px]" @click="caseFilterVisible = true">
            {{ t(columnConfig.title as string) }}
            <icon-down :class="caseFilterVisible ? 'text-[rgb(var(--primary-5))]' : ''" />
          </MsButton>
          <template #content>
            <div class="arco-table-filters-content">
              <div class="flex items-center justify-center px-[6px] py-[2px]">
                <a-checkbox-group v-model:model-value="caseFilters" direction="vertical" size="small">
                  <a-checkbox v-for="item of caseLevelList" :key="item.value" :value="item.value">
                    <caseLevel :case-level="item.text" />
                  </a-checkbox>
                </a-checkbox-group>
              </div>
            </div>
          </template>
        </a-trigger>
      </template>
      <template #status="{ record }">
        <a-select
          v-model:model-value="record.status"
          :placeholder="t('common.pleaseSelect')"
          class="param-input w-full"
          @change="() => handleStatusChange(record)"
        >
          <template #label>
            <apiStatus :status="record.status" />
          </template>
          <a-option v-for="item of Object.values(RequestDefinitionStatus)" :key="item" :value="item">
            <apiStatus :status="item" />
          </a-option>
        </a-select>
      </template>
      <template #statusFilter="{ columnConfig }">
        <a-trigger
          v-model:popup-visible="statusFilterVisible"
          trigger="click"
          @popup-visible-change="handleFilterHidden"
        >
          <MsButton type="text" class="arco-btn-text--secondary ml-[10px]" @click="statusFilterVisible = true">
            {{ t(columnConfig.title as string) }}
            <icon-down :class="statusFilterVisible ? 'text-[rgb(var(--primary-5))]' : ''" />
          </MsButton>
          <template #content>
            <div class="arco-table-filters-content">
              <div class="flex items-center justify-center px-[6px] py-[2px]">
                <a-checkbox-group v-model:model-value="statusFilters" direction="vertical" size="small">
                  <a-checkbox v-for="val of Object.values(RequestDefinitionStatus)" :key="val" :value="val">
                    <apiStatus :status="val" />
                  </a-checkbox>
                </a-checkbox-group>
              </div>
            </div>
          </template>
        </a-trigger>
      </template>
      <template #lastReportStatusFilter="{ columnConfig }">
        <a-trigger
          v-model:popup-visible="lastReportStatusFilterVisible"
          trigger="click"
          @popup-visible-change="handleFilterHidden"
        >
          <MsButton
            type="text"
            class="arco-btn-text--secondary ml-[10px]"
            @click="lastReportStatusFilterVisible = true"
          >
            {{ t(columnConfig.title as string) }}
            <icon-down :class="lastReportStatusFilterVisible ? 'text-[rgb(var(--primary-5))]' : ''" />
          </MsButton>
          <template #content>
            <div class="arco-table-filters-content">
              <div class="flex items-center justify-center px-[6px] py-[2px]">
                <a-checkbox-group v-model:model-value="lastReportStatusFilters" direction="vertical" size="small">
                  <a-checkbox v-for="val of lastReportStatusList" :key="val" :value="val">
                    <span>{{ val }}</span>
                  </a-checkbox>
                </a-checkbox-group>
              </div>
            </div>
          </template>
        </a-trigger>
      </template>
      <template #passRateColumn>
        <div class="flex items-center text-[var(--color-text-3)]">
          {{ t('case.passRate') }}
          <a-tooltip :content="t('case.passRateTip')" position="right">
            <icon-question-circle
              class="ml-[4px] text-[var(--color-text-4)] hover:text-[rgb(var(--primary-5))]"
              size="16"
            />
          </a-tooltip>
        </div>
      </template>
      <template #action="{ record }">
        <MsButton type="text" class="!mr-0">
          {{ t('apiTestManagement.execute') }}
        </MsButton>
        <a-divider direction="vertical" :margin="8"></a-divider>
        <MsButton type="text" class="!mr-0">
          {{ t('common.copy') }}
        </MsButton>
        <a-divider direction="vertical" :margin="8"></a-divider>
        <MsTableMoreAction :list="tableMoreActionList" @select="handleTableMoreActionSelect($event, record)" />
      </template>
    </ms-base-table>
  </div>
  <a-modal
    v-model:visible="showBatchEditModal"
    title-align="start"
    class="ms-modal-upload ms-modal-medium"
    :width="480"
  >
    <template #title>
      {{ t('common.edit') }}
      <div class="text-[var(--color-text-4)]">
        {{
          t('case.batchModalSubTitle', {
            count: batchParams.currentSelectCount || tableSelected.length,
          })
        }}
      </div>
    </template>
    <a-form ref="batchFormRef" class="rounded-[4px]" :model="batchForm" layout="vertical">
      <a-form-item
        field="attr"
        :label="t('apiTestManagement.chooseAttr')"
        :rules="[{ required: true, message: t('apiTestManagement.attrRequired') }]"
        asterisk-position="end"
      >
        <a-select v-model="batchForm.attr" :placeholder="t('common.pleaseSelect')">
          <a-option v-for="item of attrOptions" :key="item.value" :value="item.value">
            {{ t(item.name) }}
          </a-option>
        </a-select>
      </a-form-item>
      <a-form-item
        v-if="batchForm.attr === 'tags'"
        field="values"
        :label="t('apiTestManagement.batchUpdate')"
        :validate-trigger="['blur', 'input']"
        :rules="[{ required: true, message: t('apiTestManagement.valueRequired') }]"
        asterisk-position="end"
        class="mb-0"
        required
      >
        <MsTagsInput
          v-model:model-value="batchForm.values"
          placeholder="common.tagsInputPlaceholder"
          allow-clear
          unique-value
          retain-input-value
        />
      </a-form-item>
      <a-form-item
        v-else
        field="value"
        :label="t('apiTestManagement.batchUpdate')"
        :rules="[{ required: true, message: t('apiTestManagement.valueRequired') }]"
        asterisk-position="end"
        class="mb-0"
      >
        <a-select v-model="batchForm.value" :placeholder="t('common.pleaseSelect')" :disabled="batchForm.attr === ''">
          <a-option v-for="item of valueOptions" :key="item.value" :value="item.value">
            {{ t(item.text) }}
          </a-option>
        </a-select>
      </a-form-item>
    </a-form>
    <template #footer>
      <a-button type="secondary" :disabled="batchEditLoading" @click="cancelBatchEdit">
        {{ t('common.cancel') }}
      </a-button>
      <a-button type="primary" :loading="batchEditLoading" @click="handleBatchEditCase">
        {{ t('common.update') }}
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
  import { FormInstance, Message } from '@arco-design/web-vue';

  import MsButton from '@/components/pure/ms-button/index.vue';
  import MsBaseTable from '@/components/pure/ms-table/base-table.vue';
  import type { BatchActionParams, BatchActionQueryParams, MsTableColumn } from '@/components/pure/ms-table/type';
  import useTable from '@/components/pure/ms-table/useTable';
  import MsTableMoreAction from '@/components/pure/ms-table-more-action/index.vue';
  import { ActionsItem } from '@/components/pure/ms-table-more-action/types';
  import MsTagsInput from '@/components/pure/ms-tags-input/index.vue';
  import caseLevel from '@/components/business/ms-case-associate/caseLevel.vue';
  import apiStatus from '@/views/api-test/components/apiStatus.vue';

  import {
    batchDeleteCase,
    batchEditCase,
    deleteCase,
    dragSort,
    getCasePage,
    updateCasePriority,
    updateCaseStatus,
  } from '@/api/modules/api-test/management';
  import { getCaseDefaultFields } from '@/api/modules/case-management/featureCase';
  import { useI18n } from '@/hooks/useI18n';
  import useModal from '@/hooks/useModal';
  import useTableStore from '@/hooks/useTableStore';
  import useAppStore from '@/store/modules/app';

  import { ApiCaseDetail } from '@/models/apiTest/management';
  import { DragSortParams } from '@/models/common';
  import { RequestDefinitionStatus } from '@/enums/apiEnum';
  import { TableKeyEnum } from '@/enums/tableEnum';

  const props = defineProps<{
    activeModule: string;
    offspringIds: string[];
    protocol: string; // 查看的协议类型
  }>();

  const appStore = useAppStore();
  const { t } = useI18n();
  const tableStore = useTableStore();
  const { openModal } = useModal();

  const keyword = ref('');
  const refreshModuleTree: (() => Promise<any>) | undefined = inject('refreshModuleTree');

  const columns: MsTableColumn = [
    {
      title: 'ID',
      dataIndex: 'num',
      slotName: 'num',
      sortIndex: 1,
      sortable: {
        sortDirections: ['ascend', 'descend'],
        sorter: true,
      },
      fixed: 'left',
      width: 100,
    },
    {
      title: 'case.caseName',
      dataIndex: 'name',
      showTooltip: true,
      sortable: {
        sortDirections: ['ascend', 'descend'],
        sorter: true,
      },
      width: 180,
    },
    {
      title: 'case.caseLevel',
      dataIndex: 'priority',
      slotName: 'caseLevel',
      titleSlotName: 'caseLevelFilter',
      sortable: {
        sortDirections: ['ascend', 'descend'],
        sorter: true,
      },
      width: 150,
    },
    {
      title: 'apiTestManagement.apiStatus',
      dataIndex: 'status',
      slotName: 'status',
      titleSlotName: 'statusFilter',
      sortable: {
        sortDirections: ['ascend', 'descend'],
        sorter: true,
      },
      width: 150,
    },
    {
      title: 'apiTestManagement.path',
      dataIndex: 'path',
      showTooltip: true,
      width: 150,
    },
    {
      title: 'common.tag',
      dataIndex: 'tags',
      isTag: true,
      isStringTag: true,
      width: 150,
    },
    {
      title: 'case.lastReportStatus',
      dataIndex: 'lastReportStatus',
      titleSlotName: 'lastReportStatusFilter',
      showInTable: false,
      showTooltip: true,
      width: 150,
    },
    {
      title: 'case.passRate',
      dataIndex: 'passRate',
      titleSlotName: 'passRateColumn',
      showInTable: false,
      showTooltip: true,
      width: 150,
    },
    {
      title: 'case.caseEnvironment',
      dataIndex: 'environmentName',
      showTooltip: true,
      showInTable: false,
      width: 150,
    },
    {
      title: 'case.tableColumnUpdateUser',
      dataIndex: 'updateUser',
      showInTable: false,
      showTooltip: true,
      width: 180,
    },
    {
      title: 'case.tableColumnUpdateTime',
      dataIndex: 'updateTime',
      showInTable: false,
      showTooltip: true,
      sortable: {
        sortDirections: ['ascend', 'descend'],
        sorter: true,
      },
      width: 180,
    },
    {
      title: 'case.tableColumnCreateUser',
      dataIndex: 'createName',
      showTooltip: true,
      width: 180,
    },
    {
      title: 'case.tableColumnCreateTime',
      dataIndex: 'createTime',
      showTooltip: true,
      showInTable: false,
      sortable: {
        sortDirections: ['ascend', 'descend'],
        sorter: true,
      },
      width: 180,
    },
    {
      title: 'common.operation',
      slotName: 'action',
      dataIndex: 'operation',
      fixed: 'right',
      width: 150,
    },
  ];
  await tableStore.initColumn(TableKeyEnum.API_TEST_MANAGEMENT_CASE, columns, 'drawer');
  const { propsRes, propsEvent, loadList, setLoadListParams, resetSelector } = useTable(getCasePage, {
    columns,
    scroll: { x: '100%' },
    tableKey: TableKeyEnum.API_TEST_MANAGEMENT_CASE,
    showSetting: true,
    selectable: true,
    showSelectAll: true,
    draggable: { type: 'handle', width: 32 },
  });
  const batchActions = {
    baseAction: [
      {
        label: 'common.edit',
        eventTag: 'edit',
        permission: ['PROJECT_API_DEFINITION_CASE:READ+UPDATE'],
      },
      {
        label: 'common.delete',
        eventTag: 'delete',
        danger: true,
        permission: ['PROJECT_API_DEFINITION_CASE:READ+DELETE'],
      },
    ],
  };
  const tableMoreActionList = [
    {
      eventTag: 'delete',
      label: t('common.delete'),
      danger: true,
      permission: ['PROJECT_API_DEFINITION_CASE:READ+DELETE'],
    },
  ];

  const statusFilterVisible = ref(false);
  const statusFilters = ref(Object.keys(RequestDefinitionStatus));
  const caseLevelFields = ref<Record<string, any>>({});
  const caseFilterVisible = ref(false);
  const caseFilters = ref<string[]>([]);
  const caseLevelList = computed(() => {
    return caseLevelFields.value?.options || [];
  });
  const lastReportStatusFilterVisible = ref(false);
  const lastReportStatusList = ['error', 'FakeError', 'success'];
  const lastReportStatusFilters = ref<string[]>([...lastReportStatusList]);

  const moduleIds = computed(() => {
    return props.activeModule === 'all' ? [] : [props.activeModule];
  });
  function loadCaseList() {
    const params = {
      keyword: keyword.value,
      projectId: appStore.currentProjectId,
      moduleIds: moduleIds.value,
      protocol: props.protocol,
      filter: {
        status: statusFilters.value,
        priority: caseFilters.value,
        lastReportStatus: lastReportStatusFilters.value,
      },
    };
    setLoadListParams(params);
    loadList();
  }
  function loadCaseListAndResetSelector() {
    resetSelector();
    loadCaseList();
  }

  // 获取用例等级数据
  async function getCaseLevelFields() {
    const result = await getCaseDefaultFields(appStore.currentProjectId);
    caseLevelFields.value = result.customFields.find((item: any) => item.internal && item.fieldName === '用例等级');
    caseFilters.value = caseLevelFields.value?.options.map((item: any) => item.value);
  }

  onBeforeMount(() => {
    loadCaseList();
    getCaseLevelFields();
  });

  function handleFilterHidden(val: boolean) {
    if (!val) {
      loadCaseList();
    }
  }

  watch(
    () => props.activeModule,
    () => {
      loadCaseListAndResetSelector();
    }
  );

  watch(
    () => props.protocol,
    () => {
      loadCaseListAndResetSelector();
    }
  );

  async function handleStatusChange(record: ApiCaseDetail) {
    try {
      await updateCaseStatus(record.id, record.status);
      Message.success(t('common.updateSuccess'));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  async function handleCaseLevelChange(record: ApiCaseDetail) {
    try {
      await updateCasePriority(record.id, record.priority);
      Message.success(t('common.updateSuccess'));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  // 拖拽排序
  async function handleDragChange(params: DragSortParams) {
    try {
      await dragSort(params);
      Message.success(t('caseManagement.featureCase.sortSuccess'));
      loadCaseList();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  const tableSelected = ref<(string | number)[]>([]); // 表格选中的
  const batchParams = ref<BatchActionQueryParams>({
    selectedIds: [],
    selectAll: false,
    excludeIds: [],
    currentSelectCount: 0,
  });
  const batchConditionParams = computed(() => {
    return {
      condition: {
        keyword: keyword.value,
        filter: {
          status: statusFilters.value,
          priority: caseFilters.value,
          lastReportStatus: lastReportStatusFilters.value,
        },
      },
      projectId: appStore.currentProjectId,
      protocol: props.protocol,
      moduleIds: moduleIds.value,
    };
  });

  function handleDeleteCase(record?: ApiCaseDetail, isBatch?: boolean) {
    const title = isBatch
      ? t('case.batchDeleteCaseTip', {
          count: batchParams.value.currentSelectCount || tableSelected.value.length,
        })
      : t('apiTestManagement.deleteApiTipTitle', { name: record?.name });

    openModal({
      type: 'error',
      title,
      content: t('case.deleteCaseTip'),
      okText: t('common.confirmDelete'),
      cancelText: t('common.cancel'),
      okButtonProps: {
        status: 'danger',
      },
      maskClosable: false,
      onBeforeOk: async () => {
        try {
          if (isBatch) {
            await batchDeleteCase({
              selectIds: tableSelected.value as string[],
              selectAll: batchParams.value.selectAll,
              excludeIds: batchParams.value?.excludeIds || [],
              ...batchConditionParams.value,
            });
          } else {
            await deleteCase(record?.id as string);
          }
          Message.success(t('common.deleteSuccess'));
          loadCaseListAndResetSelector();
          if (typeof refreshModuleTree === 'function') {
            refreshModuleTree();
          }
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        }
      },
      hideCancel: false,
    });
  }

  // 处理表格更多按钮事件
  function handleTableMoreActionSelect(item: ActionsItem, record: ApiCaseDetail) {
    switch (item.eventTag) {
      case 'delete':
        handleDeleteCase(record);
        break;
      default:
        break;
    }
  }

  function handleTableSelect(arr: (string | number)[]) {
    tableSelected.value = arr;
  }

  // 用例编辑
  const showBatchEditModal = ref(false);
  const batchEditLoading = ref(false);
  const batchFormRef = ref<FormInstance>();
  const batchForm = ref({
    attr: '',
    value: '',
    values: [],
  });
  const attrOptions = [
    {
      name: 'case.caseLevel',
      value: 'priority',
    },
    {
      name: 'apiTestManagement.apiStatus',
      value: 'status',
    },
    {
      name: 'common.tag',
      value: 'tags',
    },
  ];
  const valueOptions = computed(() => {
    batchForm.value.value = '';
    switch (batchForm.value.attr) {
      case 'priority':
        return caseLevelList.value;
      case 'status':
        return [
          {
            text: 'apiTestManagement.processing',
            value: RequestDefinitionStatus.PROCESSING,
          },
          {
            text: 'apiTestManagement.done',
            value: RequestDefinitionStatus.DONE,
          },
          {
            text: 'apiTestManagement.deprecate',
            value: RequestDefinitionStatus.DEPRECATED,
          },
          {
            text: 'apiTestManagement.debugging',
            value: RequestDefinitionStatus.DEBUGGING,
          },
        ];
      default:
        return [];
    }
  });
  function cancelBatchEdit() {
    showBatchEditModal.value = false;
    batchFormRef.value?.resetFields();
    batchForm.value = {
      attr: '',
      value: '',
      values: [],
    };
  }
  function handleBatchEditCase() {
    batchFormRef.value?.validate(async (errors) => {
      if (!errors) {
        try {
          batchEditLoading.value = true;
          await batchEditCase({
            selectIds: batchParams.value?.selectedIds || [],
            selectAll: !!batchParams.value?.selectAll,
            excludeIds: batchParams.value?.excludeIds || [],
            ...batchConditionParams.value,
            type: batchForm.value.attr.charAt(0).toUpperCase() + batchForm.value.attr.slice(1), // 首字母大写
            [batchForm.value.attr]: batchForm.value.attr === 'tags' ? batchForm.value.values : batchForm.value.value,
          });
          Message.success(t('common.updateSuccess'));
          cancelBatchEdit();
          loadCaseListAndResetSelector();
        } catch (error) {
          // eslint-disable-next-line no-console
          console.log(error);
        } finally {
          batchEditLoading.value = false;
        }
      }
    });
  }

  // 处理表格选中后批量操作
  function handleTableBatch(event: BatchActionParams, params: BatchActionQueryParams) {
    tableSelected.value = params?.selectedIds || [];
    batchParams.value = params;
    switch (event.eventTag) {
      case 'delete':
        handleDeleteCase(undefined, true);
        break;
      case 'edit':
        showBatchEditModal.value = true;
        break;
      default:
        break;
    }
  }
</script>

<style lang="less" scoped>
  :deep(.param-input:not(.arco-input-focus, .arco-select-view-focus)) {
    &:not(:hover) {
      border-color: transparent !important;
      .arco-input::placeholder {
        @apply invisible;
      }
      .arco-select-view-icon {
        @apply invisible;
      }
      .arco-select-view-value {
        color: var(--color-text-brand);
      }
    }
  }
</style>