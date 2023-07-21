<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <div>
        <a-button class="mr-3" type="primary" @click="AddMember">{{ t('organization.member.addMember') }}</a-button>
      </div>
      <a-input-search :placeholder="t('organization.member.searchMember')" class="w-[230px]"></a-input-search>
    </div>
    <ms-base-table
      v-bind="propsRes"
      :action-config="tableBatchActions"
      @selected-change="handleTableSelect"
      v-on="propsEvent"
    >
      <template #project="{ record }">
        <a-tag v-for="pro of record.projectList.slice(0, 2)" :key="pro.id" class="mr-[4px] bg-transparent" bordered>
          {{ pro.name }}
        </a-tag>
      </template>
      <template #userRole="{ record }">
        <a-tag
          v-for="org of record.userRoleList.slice(0, 2)"
          :key="org.id"
          class="mr-[4px] border-[rgb(var(--primary-5))] bg-transparent !text-[rgb(var(--primary-5))]"
          bordered
        >
          {{ org.name }}
        </a-tag>
      </template>
      <template #enable="{ record }">
        <div v-if="record.enable" class="flex items-center">
          <icon-check-circle-fill class="mr-[2px] text-[rgb(var(--success-6))]" />
          {{ t('organization.member.tableEnable') }}
        </div>
        <div v-else class="flex items-center text-[var(--color-text-4)]">
          <icon-stop class="mr-[2px]" />
          {{ t('organization.member.tableDisable') }}
        </div>
      </template>

      <template #action="{ record }">
        <MsButton @click="editMember(record)">{{ t('organization.member.edit') }}</MsButton>
        <MsButton @click="deleteMember(record)">{{ t('organization.member.remove') }}</MsButton>
      </template>
    </ms-base-table>
    <!-- <add-member-modal :visible="addMemberVisible" @cancel="addMemberVisible = false" /> -->
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref, reactive } from 'vue';
  import { useI18n } from '@/hooks/useI18n';
  import MsBaseTable from '@/components/pure/ms-table/base-table.vue';
  import MsButton from '@/components/pure/ms-button/index.vue';
  import { Message } from '@arco-design/web-vue';
  import useTable from '@/components/pure/ms-table/useTable';
  import addMemberModal from './components/addMemberModal.vue';
  import { getMemberList } from '@/api/modules/setting/member';
  import type { MsTableColumn } from '@/components/pure/ms-table/type';
  import useModal from '@/hooks/useModal';
  import { useCommandComponent } from '@/hooks/useCommandComponent';

  const columns: MsTableColumn = [
    {
      title: 'organization.member.tableColunmEmail',
      dataIndex: 'email',
      width: 200,
    },
    {
      title: 'organization.member.tableColunmName',
      dataIndex: 'name',
    },
    {
      title: 'organization.member.tableColunmPhone',
      dataIndex: 'phone',
    },
    {
      title: 'organization.member.tableColunmPro',
      slotName: 'project',
      dataIndex: 'projectList',
      width: 250,
    },
    {
      title: 'organization.member.tableColunmUsergroup',
      slotName: 'userRole',
      dataIndex: 'userRoleList',
      width: 250,
    },
    {
      title: 'organization.member.tableColunmStatus',
      slotName: 'enable',
      dataIndex: 'enable',
    },
    {
      title: 'organization.member.tableColunmActions',
      slotName: 'action',
      fixed: 'right',
      width: 110,
    },
  ];

  const tableBatchActions = {
    baseAction: [
      {
        label: 'organization.member.batchActionAddProject',
        eventTag: 'batchAddProject',
      },
      {
        label: 'organization.member.batchActionAddUsergroup',
        eventTag: 'batchAddUsergroup',
      },
    ],
  };

  const { propsRes, propsEvent, loadList, setKeyword } = useTable(getMemberList, {
    columns,
    scroll: { y: 'auto', x: 1200 },
    selectable: true,
  });

  const keyword = ref('');
  const addMemberDialog = useCommandComponent(addMemberModal);
  const addMembersOptions = reactive({
    title: '添加成员',
    visible: false,
    onClose: () => {
      addMemberDialog.close();
    },
  });

  onMounted(async () => {
    setKeyword(keyword.value);
    await loadList();
  });

  const { t } = useI18n();
  const { openModal } = useModal();

  function deleteMember(record: any) {
    openModal({
      type: 'warning',
      title: t('organization.member.deleteMemberTip', { name: record.name }),
      content: '',
      okText: t('organization.member.deleteMemberConfirm'),
      cancelText: t('organization.member.deleteMemberCancel'),
      okButtonProps: {
        status: 'danger',
      },
      onBeforeOk: async () => {
        try {
          Message.success(t('organization.member.deleteMemberSuccess'));
          return true;
        } catch (error) {
          console.log(error);
          return false;
        }
      },
      hideCancel: false,
    });
  }
  function editMember(record: any) {}
  const tableSelected = ref<(string | number)[]>([]);
  function handleTableSelect(selectArr: (string | number)[]) {
    tableSelected.value = selectArr;
  }
  function AddMember() {
    addMembersOptions.visible = true;
    addMemberDialog(addMembersOptions);
  }
</script>

<style lang="less" scoped></style>
@/api/modules/setting/member