<template>
  <div class="mb-4 flex items-center justify-between">
    <a-button type="primary" @click="addPool">
      {{ t('system.resourcePool.createPool') }}
    </a-button>
    <a-input-search
      :placeholder="t('system.resourcePool.searchPool')"
      class="w-[230px]"
      @search="searchPool"
    ></a-input-search>
  </div>
  <ms-base-table v-bind="propsRes" no-disable v-on="propsEvent">
    <template #name="{ record }">
      <a-button type="text" @click="showPoolDetail(record)">{{ record.name }}</a-button>
    </template>
    <template #enable="{ record }">
      <div v-if="record.enable" class="flex items-center">
        <icon-check-circle-fill class="mr-[2px] text-[rgb(var(--success-6))]" />
        {{ t('system.resourcePool.tableEnable') }}
      </div>
      <div v-else class="flex items-center text-[var(--color-text-4)]">
        <icon-stop class="mr-[2px]" />
        {{ t('system.resourcePool.tableDisable') }}
      </div>
    </template>
    <template #action="{ record }">
      <MsButton @click="editPool(record)">{{ t('system.resourcePool.editPool') }}</MsButton>
      <MsButton v-if="record.enable" @click="disabledPool(record)">{{
        t('system.resourcePool.tableDisable')
      }}</MsButton>
      <MsButton v-else @click="enablePool(record)">{{ t('system.resourcePool.tableEnable') }}</MsButton>
      <MsTableMoreAction :list="tableActions" @select="handleSelect($event, record)"></MsTableMoreAction>
    </template>
  </ms-base-table>
  <MsDrawer
    v-model:visible="showDetailDrawer"
    width="480px"
    :title="activePool?.name"
    :title-tag="activePool?.enable ? t('system.resourcePool.tableEnable') : t('system.resourcePool.tableDisable')"
    :title-tag-color="activePool?.enable ? 'green' : 'gray'"
    :descriptions="activePoolDesc"
    :footer="false"
    :mask="false"
  >
    <template #tbutton>
      <a-button type="outline" size="mini" @click="editPool(activePool)">
        {{ t('system.resourcePool.editPool') }}
      </a-button>
    </template>
  </MsDrawer>
  <JobTemplateDrawer v-model:visible="showJobDrawer" :value="activePool?.testResourceDTO.jobDefinition || ''" />
</template>

<script setup lang="ts">
  import { onMounted, Ref, ref } from 'vue';
  import { useRouter } from 'vue-router';
  import { Message } from '@arco-design/web-vue';
  import { useI18n } from '@/hooks/useI18n';
  import { getPoolList } from '@/api/modules/setting/resourcePool';
  import useModal from '@/hooks/useModal';
  import MsBaseTable from '@/components/pure/ms-table/base-table.vue';
  import useTable from '@/components/pure/ms-table/useTable';
  import MsButton from '@/components/pure/ms-button/index.vue';
  import MsTableMoreAction from '@/components/pure/ms-table-more-action/index.vue';
  import MsDrawer from '@/components/pure/ms-drawer/index.vue';
  import JobTemplateDrawer from './components/jobTemplateDrawer.vue';

  import type { Description } from '@/components/pure/ms-description/index.vue';
  import type { MsTableColumn } from '@/components/pure/ms-table/type';
  import type { ActionsItem } from '@/components/pure/ms-table-more-action/types';
  import type { ResourcePoolItem } from '@/models/setting/resourcePool';

  const { t } = useI18n();
  const router = useRouter();

  const columns: MsTableColumn = [
    {
      title: 'system.resourcePool.tableColunmName',
      slotName: 'name',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: 'system.resourcePool.tableColunmStatus',
      slotName: 'enable',
      dataIndex: 'enable',
    },
    {
      title: 'system.resourcePool.tableColunmDescription',
      dataIndex: 'description',
    },
    {
      title: 'system.resourcePool.tableColunmType',
      dataIndex: 'type',
    },
    {
      title: 'system.resourcePool.tableColunmCreateTime',
      dataIndex: 'createTime',
    },
    {
      title: 'system.resourcePool.tableColunmUpdateTime',
      dataIndex: 'updateTime',
    },
    {
      title: 'system.resourcePool.tableColunmActions',
      slotName: 'action',
      fixed: 'right',
      width: 120,
    },
  ];

  const { propsRes, propsEvent, loadList, setKeyword } = useTable(getPoolList, {
    columns,
    scroll: { y: 'auto' },
    selectable: false,
    showSelectAll: false,
  });

  const keyword = ref('');

  onMounted(async () => {
    setKeyword(keyword.value);
    await loadList();
  });

  async function searchPool() {
    setKeyword(keyword.value);
    await loadList();
  }

  const { openModal } = useModal();

  const tableActions: ActionsItem[] = [
    {
      label: 'system.resourcePool.delete',
      eventTag: 'delete',
      danger: true,
    },
  ];

  /**
   * 启用资源池
   */
  function enablePool(record: any) {
    try {
      Message.success(t('system.resourcePool.enablePoolSuccess'));
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  /**
   * 禁用资源池
   */
  function disabledPool(record: any) {
    openModal({
      type: 'warning',
      title: t('system.resourcePool.disablePoolTip', { name: record.name }),
      content: t('system.resourcePool.disablePoolContent'),
      okText: t('system.resourcePool.disablePoolConfirm'),
      cancelText: t('system.resourcePool.disablePoolCancel'),
      okButtonProps: {
        status: 'danger',
      },
      onBeforeOk: async () => {
        try {
          Message.success(t('system.resourcePool.disablePoolSuccess'));
          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      },
      hideCancel: false,
    });
  }

  /**
   * 删除资源池
   */
  function deletePool(record: any) {
    openModal({
      type: 'warning',
      title: t('system.resourcePool.deletePoolTip', { name: record.name }),
      content: t('system.resourcePool.deletePoolContentUsed'),
      okText: t('system.resourcePool.deletePoolConfirm'),
      cancelText: t('system.resourcePool.deletePoolCancel'),
      okButtonProps: {
        status: 'danger',
      },
      onBeforeOk: async () => {
        try {
          Message.success(t('system.resourcePool.deletePoolSuccess'));
          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      },
      hideCancel: false,
    });
  }

  /**
   * 处理表格更多按钮事件
   * @param item
   */
  function handleSelect(item: ActionsItem, record: any) {
    switch (item.eventTag) {
      case 'delete':
        deletePool(record);
        break;
      default:
        break;
    }
  }

  const showDetailDrawer = ref(false);
  const activePoolDesc: Ref<Description[]> = ref([]);
  const activePool: Ref<ResourcePoolItem | null> = ref(null);
  const showJobDrawer = ref(false);
  /**
   * 查看资源池详情
   * @param record
   */
  function showPoolDetail(record: any) {
    activePool.value = { ...record };
    if (activePool.value) {
      const poolUses = [
        activePool.value.loadTest ? t('system.resourcePool.usePerformance') : '',
        activePool.value.apiTest ? t('system.resourcePool.useAPI') : '',
        activePool.value.uiTest ? t('system.resourcePool.useUI') : '',
      ];
      const { type, testResourceDTO, loadTest, apiTest, uiTest } = activePool.value;
      const {
        ip,
        token, // k8s token
        nameSpaces, // k8s 命名空间
        concurrentNumber, // k8s 最大并发数
        podThreads, // k8s 单pod最大线程数
        apiTestImage, // k8s api测试镜像
        deployName, // k8s api测试部署名称
        nodesList,
        loadTestImage,
        loadTestHeap,
        uiGrid,
      } = testResourceDTO;
      // Node
      const nodeResourceDesc =
        type === 'Node'
          ? [
              {
                label: t('system.resourcePool.detailResources'),
                value: nodesList?.map((e) => `${e.ip},${e.port},${e.monitor},${e.concurrentNumber}`),
                isTag: true,
              },
            ]
          : [];
      // K8S
      const k8sResourceDesc =
        type === 'Kubernetes'
          ? [
              {
                label: t('system.resourcePool.testResourceDTO.ip'),
                value: ip,
              },
              {
                label: t('system.resourcePool.testResourceDTO.token'),
                value: token,
              },
              {
                label: t('system.resourcePool.testResourceDTO.nameSpaces'),
                value: nameSpaces,
              },
              {
                label: t('system.resourcePool.testResourceDTO.deployName'),
                value: deployName,
              },
              {
                label: t('system.resourcePool.testResourceDTO.apiTestImage'),
                value: apiTestImage,
              },
              {
                label: t('system.resourcePool.testResourceDTO.concurrentNumber'),
                value: concurrentNumber,
              },
              {
                label: t('system.resourcePool.testResourceDTO.podThreads'),
                value: podThreads,
              },
              {
                label: t('system.resourcePool.jobTemplate'),
                value: t('system.resourcePool.customJobTemplate'),
                isButton: true,
                onClick: () => {
                  showJobDrawer.value = true;
                },
              },
            ]
          : [];
      // 性能测试
      const performanceDesc = loadTest
        ? [
            {
              label: t('system.resourcePool.mirror'),
              value: loadTestImage,
            },
            {
              label: t('system.resourcePool.testHeap'),
              value: loadTestHeap,
            },
          ]
        : [];
      // 接口测试/性能测试
      const resourceDesc = apiTest || loadTest ? [...nodeResourceDesc, ...k8sResourceDesc] : [];
      // ui 测试资源
      const uiDesc = uiTest
        ? [
            {
              label: t('system.resourcePool.uiGrid'),
              value: uiGrid,
            },
            {
              label: t('system.resourcePool.concurrentNumber'),
              value: concurrentNumber,
            },
          ]
        : [];
      activePoolDesc.value = [
        {
          label: t('system.resourcePool.detailDesc'),
          value: activePool.value.description,
        },
        {
          label: t('system.resourcePool.detailUrl'),
          value: activePool.value.serverUrl,
        },
        {
          label: t('system.resourcePool.detailRange'),
          value: activePool.value.allOrg
            ? [t('system.resourcePool.orgAll')]
            : activePool.value.testResourceDTO.orgIds.join(','),
          isTag: true,
        },
        {
          label: t('system.resourcePool.detailUse'),
          value: poolUses.filter((e) => e !== ''),
          isTag: true,
        },
        ...performanceDesc,
        ...uiDesc,
        {
          label: t('system.resourcePool.detailType'),
          value: activePool.value.type,
        },
        ...resourceDesc,
      ];
    }

    showDetailDrawer.value = true;
  }

  /**
   * 编辑资源池
   * @param record
   */
  function editPool(record: any) {
    router.push({
      name: 'settingSystemResourcePoolDetail',
      query: {
        id: record.id,
      },
    });
  }

  /**
   * 添加资源池
   * @param record
   */
  function addPool(record: any) {
    router.push({
      name: 'settingSystemResourcePoolDetail',
    });
  }
</script>

<style lang="less" scoped></style>
@/models/setting/resourcePool @/api/modules/setting/resourcePool