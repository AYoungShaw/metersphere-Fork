<template>
  <MsMinderEditor
    v-model:extra-visible="extraVisible"
    v-model:loading="loading"
    v-model:import-json="importJson"
    :tags="[]"
    :insert-node="(node, type) => insertNode(node as PlanMinderNode,type)"
    :can-show-enter-node="false"
    :insert-sibling-menus="insertSiblingMenus"
    :insert-son-menus="insertSonMenus"
    :can-show-paste-menu="false"
    :can-show-more-menu="false"
    :can-show-priority-menu="false"
    :can-show-float-menu="canShowFloatMenu"
    :can-show-delete-menu="canShowDeleteMenu"
    custom-priority
    single-tag
    tag-enable
    sequence-enable
    @node-select="(node) => handleNodeSelect(node as PlanMinderNode)"
    @before-exec-command="handleBeforeExecCommand"
    @save="handleMinderSave"
    @float-menu-close="handleFloatMenuClose"
  >
    <template #extractMenu>
      <a-tooltip v-if="showAssociateCaseMenu" :content="t('ms.case.associate.title')">
        <MsButton type="icon" class="ms-minder-node-float-menu-icon-button" @click="associateCase">
          <MsIcon type="icon-icon_add_outlined" class="text-[var(--color-text-4)]" />
        </MsButton>
      </a-tooltip>
      <a-dropdown
        v-if="canShowExecuteMethodMenu"
        v-model:popup-visible="executeMethodMenuVisible"
        class="ms-minder-dropdown"
        :popup-translate="[0, 4]"
        position="bl"
        trigger="click"
        @select="(val) => handleExecuteMethodMenuSelect(val as RunMode)"
      >
        <a-tooltip :content="t('ms.minders.executeMethod')">
          <MsButton
            type="icon"
            class="ms-minder-node-float-menu-icon-button"
            :class="[executeMethodMenuVisible ? 'ms-minder-node-float-menu-icon-button--focus' : '']"
          >
            <MsIcon type="icon-icon_play-round_filled" class="text-[var(--color-text-4)]" />
          </MsButton>
        </a-tooltip>
        <template #content>
          <div class="mx-[6px] px-[8px] py-[3px] text-[var(--color-text-4)]">
            {{ t('ms.minders.executeMethod') }}
          </div>
          <a-doption :value="RunMode.SERIAL">
            <div
              class="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[rgb(var(--link-1))] text-[12px] font-medium text-[rgb(var(--link-5))]"
            >
              {{ t('ms.minders.serial') }}
            </div>
          </a-doption>
          <a-doption :value="RunMode.PARALLEL">
            <div
              class="flex h-[20px] w-[20px] items-center justify-center rounded-full bg-[rgb(var(--success-1))] text-[12px] font-medium text-[rgb(var(--success-6))]"
            >
              {{ t('ms.minders.parallel') }}
            </div>
          </a-doption>
        </template>
      </a-dropdown>
      <a-tooltip v-if="showConfigMenu" :content="t('common.config')">
        <MsButton
          type="icon"
          class="ms-minder-node-float-menu-icon-button"
          :class="[extraVisible ? 'ms-minder-node-float-menu-icon-button--focus' : '']"
          @click="toggleConfig"
        >
          <MsIcon type="icon-icon_setting_filled" class="text-[var(--color-text-4)]" />
        </MsButton>
      </a-tooltip>
    </template>
    <template #extractTabContent>
      <div v-if="configForm" class="px-[16px]">
        <div class="mb-[16px] flex items-center gap-[8px]">
          <div class="h-[14px] w-[3px] rounded-[var(--border-radius-small)] bg-[rgb(var(--primary-4))]"></div>
          <a-tooltip :content="configForm.text" position="tl">
            <div class="one-line-text font-medium">{{ configForm.text }}</div>
          </a-tooltip>
        </div>
        <a-form ref="configFormRef" :model="configForm" layout="vertical">
          <a-form-item>
            <template #label>
              <div class="flex items-center">
                <div>{{ t('testPlan.planForm.pickCases') }}</div>
                <a-divider margin="4px" direction="vertical" />
                <MsButton
                  type="text"
                  :disabled="
                    (selectedAssociateCasesParams.totalCount || selectedAssociateCasesParams.selectIds.length) === 0
                  "
                  @click="clearSelectedCases"
                >
                  {{ t('caseManagement.caseReview.clearSelectedCases') }}
                </MsButton>
              </div>
            </template>
            <div class="bg-[var(--color-text-n9)] p-[12px]">
              <div class="flex items-center">
                <div class="text-[var(--color-text-2)]">
                  {{
                    t('caseManagement.caseReview.selectedCases', {
                      count: selectedAssociateCasesParams.selectAll
                        ? selectedAssociateCasesParams.totalCount
                        : selectedAssociateCasesParams.selectIds.length,
                    })
                  }}
                </div>
                <a-divider margin="8px" direction="vertical" />
                <MsButton
                  v-permission="['CASE_REVIEW:READ+RELEVANCE']"
                  type="text"
                  class="font-medium"
                  @click="caseAssociateVisible = true"
                >
                  {{ t('ms.case.associate.title') }}
                </MsButton>
              </div>
            </div>
          </a-form-item>
          <template
            v-if="
              configForm.type !== PlanMinderCollectionType.FUNCTIONAL &&
              (configForm.level === 1 || !configForm.extended)
            "
          >
            <a-form-item :label="t('system.project.resourcePool')">
              <a-select v-model:model-value="configForm.testResourcePoolId" :options="resourcePoolOptions"></a-select>
            </a-form-item>
            <a-form-item :label="t('project.environmental.env')">
              <a-select v-model:model-value="configForm.environmentId" :options="environmentOptions"></a-select>
            </a-form-item>
            <a-form-item class="hidden-item">
              <a-radio-group v-model:model-value="configForm.executeMethod">
                <a-radio :value="RunMode.SERIAL">{{ t('testPlan.testPlanIndex.serial') }}</a-radio>
                <a-radio :value="RunMode.PARALLEL">{{ t('testPlan.testPlanIndex.parallel') }}</a-radio>
              </a-radio-group>
            </a-form-item>
            <a-form-item v-if="configForm.executeMethod === RunMode.SERIAL" class="hidden-item">
              <div class="flex items-center gap-[8px]">
                <a-switch v-model:model-value="configForm.stopOnFail" size="small"></a-switch>
                <div>{{ t('ms.minders.failStop') }}</div>
              </div>
            </a-form-item>
            <a-form-item class="hidden-item">
              <div class="flex items-center gap-[8px]">
                <a-switch v-model:model-value="configForm.retryOnFail" size="small"></a-switch>
                <div>{{ t('ms.minders.failRetry') }}</div>
              </div>
            </a-form-item>
            <template v-if="configForm.retryOnFail">
              <a-form-item v-if="configForm.type === PlanMinderCollectionType.SCENARIO" class="hidden-item">
                <a-radio-group v-model:model-value="configForm.retryType">
                  <a-radio :value="FailRetry.STEP">{{ t('ms.minders.stepRetry') }}</a-radio>
                  <a-radio :value="FailRetry.SCENARIO">{{ t('ms.minders.scenarioRetry') }}</a-radio>
                </a-radio-group>
              </a-form-item>
              <a-form-item>
                <template #label>
                  <div class="flex items-center">
                    <div>{{ t('ms.minders.retry') }}</div>
                    <div class="text-[var(--color-text-4)]">{{ t('ms.minders.retryTimes') }}</div>
                  </div>
                </template>
                <a-input-number
                  v-model:model-value="configForm.retryTimes"
                  mode="button"
                  :step="1"
                  :min="1"
                  :precision="0"
                  size="small"
                  class="w-[120px]"
                ></a-input-number>
              </a-form-item>
              <a-form-item>
                <template #label>
                  <div class="flex items-center">
                    <div>{{ t('ms.minders.retrySpace') }}</div>
                    <div class="text-[var(--color-text-4)]">{{ t('ms.minders.retrySpaces') }}</div>
                  </div>
                </template>
                <a-input-number
                  v-model:model-value="configForm.retryInterval"
                  mode="button"
                  :step="100"
                  :min="0"
                  :precision="0"
                  size="small"
                  class="w-[120px]"
                ></a-input-number>
              </a-form-item>
            </template>
          </template>
          <a-form-item
            v-if="configForm.type !== PlanMinderCollectionType.FUNCTIONAL && configForm.level === 2"
            class="hidden-item"
          >
            <div class="flex items-center gap-[8px]">
              <a-switch v-model:model-value="configForm.extended" size="small"></a-switch>
              <div>{{ t('ms.minders.extend') }}</div>
            </div>
          </a-form-item>
        </a-form>
        <div class="flex items-center gap-[12px] bg-white pb-[16px]">
          <a-button
            v-permission="['FUNCTIONAL_CASE:READ+UPDATE']"
            type="primary"
            :loading="loading"
            @click="handleConfigSave"
          >
            {{ t('common.save') }}
          </a-button>
          <a-button type="secondary" :disabled="loading" @click="handleConfigCancel">{{ t('common.cancel') }}</a-button>
        </div>
      </div>
    </template>
  </MsMinderEditor>
  <caseAssociate
    v-model:visible="caseAssociateVisible"
    v-model:currentSelectCase="currentSelectCase"
    :has-not-associated-ids="selectedAssociateCasesParams.selectIds"
    :test-plan-id="props.planId"
    @success="writeAssociateCases"
  />
</template>

<script setup lang="ts">
  import { FormInstance, SelectOptionData } from '@arco-design/web-vue';
  import { cloneDeep } from 'lodash-es';

  import MsButton from '@/components/pure/ms-button/index.vue';
  import MsMinderEditor from '@/components/pure/ms-minder-editor/minderEditor.vue';
  import {
    InsertMenuItem,
    MinderEvent,
    MinderJson,
    MinderJsonNode,
    MinderJsonNodeData,
  } from '@/components/pure/ms-minder-editor/props';
  import { setCustomPriorityView } from '@/components/pure/ms-minder-editor/script/tool/utils';
  import caseAssociate from './associateDrawer.vue';

  import { getPoolOption } from '@/api/modules/api-test/management';
  import { editPlanMinder, getPlanMinder } from '@/api/modules/test-plan/testPlan';
  import { useI18n } from '@/hooks/useI18n';
  import useAppStore from '@/store/modules/app';
  import useMinderStore from '@/store/modules/components/minder-editor';
  import { filterTree, getGenerateId, mapTree } from '@/utils';

  import {
    AssociateCaseRequest,
    PlanMinderEditListItem,
    PlanMinderNode,
    PlanMinderNodeData,
  } from '@/models/testPlan/testPlan';
  import { CaseLinkEnum } from '@/enums/caseEnum';
  import { MinderEventName } from '@/enums/minderEnum';
  import { FailRetry, PlanMinderAssociateType, PlanMinderCollectionType, RunMode } from '@/enums/testPlanEnum';

  import Message from '@arco-design/web-vue/es/message';

  const props = defineProps<{
    planId: string;
  }>();

  const appStore = useAppStore();
  const { t } = useI18n();
  const minderStore = useMinderStore();
  const loading = ref(false);
  const importJson = ref<MinderJson>({
    root: {} as MinderJsonNode,
    template: 'default',
    treePath: [],
  });
  const caseCountTag = t('ms.minders.caseCount');
  const resourcePoolTag = t('ms.minders.resourcePool');
  const envTag = t('ms.minders.env');

  const canShowFloatMenu = ref(false);
  const insertSiblingMenus = ref<InsertMenuItem[]>([]);
  const insertSonMenus = ref<InsertMenuItem[]>([]);
  const showAssociateCaseMenu = ref(false);
  const canShowExecuteMethodMenu = ref(true);
  const executeMethodMenuVisible = ref(false);
  const showConfigMenu = ref(false);
  const canShowDeleteMenu = ref(false);
  const extraVisible = ref<boolean>(false);

  /**
   * 检测节点可展示的菜单项
   * @param node 选中节点
   */
  function checkNodeCanShowMenu(node: PlanMinderNode) {
    const { data } = node;

    if (data?.level === 1 || data?.level === 2) {
      canShowFloatMenu.value = true;
      if (data?.type === PlanMinderCollectionType.FUNCTIONAL) {
        // 功能用例分类没有执行方式
        canShowExecuteMethodMenu.value = false;
      } else {
        canShowExecuteMethodMenu.value = true;
      }
      if (data?.level === 1) {
        // 测试分类只能添加下级测试集
        insertSiblingMenus.value = [];
        insertSonMenus.value = [
          {
            value: 'testSet',
            label: t('ms.minders.testSet'),
          },
        ];
        if (data?.type === PlanMinderCollectionType.FUNCTIONAL) {
          // 功能用例分类不能配置任何东西
          showConfigMenu.value = false;
        } else {
          showConfigMenu.value = true;
        }
        showAssociateCaseMenu.value = false;
        canShowDeleteMenu.value = false;
      } else {
        // 测试集只能添加同级测试集
        insertSiblingMenus.value = [
          {
            value: 'testSet',
            label: t('ms.minders.testSet'),
          },
        ];
        insertSonMenus.value = [];
        showAssociateCaseMenu.value = true;
        showConfigMenu.value = true;
        canShowDeleteMenu.value = true;
      }
    } else {
      canShowFloatMenu.value = false;
      canShowExecuteMethodMenu.value = false;
      showAssociateCaseMenu.value = false;
      showConfigMenu.value = false;
      extraVisible.value = false;
      canShowDeleteMenu.value = false;
    }
  }

  /**
   * 执行插入节点
   * @param command 插入命令
   * @param node 目标节点
   */
  function execInert(command: string, data?: PlanMinderNodeData | MinderJsonNodeData) {
    if (window.minder.queryCommandState(command) !== -1) {
      window.minder.execCommand(command, data);
    }
  }

  /**
   * 插入节点
   * @param node 目标节点
   * @param type 插入类型
   * @param value 插入值
   */
  function insertNode(node: PlanMinderNode, type: string) {
    let child: PlanMinderNodeData | undefined;
    // 用例数子节点
    const caseCountNodeData = {
      id: getGenerateId(),
      text: t('ms.minders.item', { count: 0 }),
      resource: [caseCountTag],
      level: 3,
      isNew: true,
    };
    // 环境子节点
    const envNodeData = {
      id: getGenerateId(),
      text: t('case.execute.defaultEnv'),
      resource: [envTag],
      level: 3,
      isNew: true,
    };
    // 资源池子节点
    const resourcePoolNodeData = {
      id: getGenerateId(),
      resource: [resourcePoolTag],
      text: t('ms.minders.defaultResourcePool'),
      level: 3,
      isNew: true,
    };
    if (node.data?.level === 1) {
      // 测试分类下插入测试集
      child = {
        ...node.data,
        id: getGenerateId(),
        text: t('ms.minders.defaultTestSet'),
        level: 2,
        isNew: true,
      };
    } else if (node.parent?.data) {
      // 测试集同级插入测试集
      child = {
        ...(node.parent.data as PlanMinderNodeData),
        id: getGenerateId(),
        text: t('ms.minders.defaultTestSet'),
        level: 2,
        isNew: true,
      };
    }
    if (child) {
      execInert(type, child);
      nextTick(() => {
        execInert('AppendChildNode', caseCountNodeData);
        if (node.data?.type !== PlanMinderCollectionType.FUNCTIONAL) {
          // 功能用例测试集没有环境和资源池
          execInert('AppendSiblingNode', envNodeData);
          execInert('AppendSiblingNode', resourcePoolNodeData);
        }
      });
    }
  }

  // 当前激活的测试集节点
  const activePlanSet = ref<PlanMinderNode>();

  const currentPriority = ref<RunMode>(RunMode.SERIAL);
  // 优先级与串行/并行文本映射
  const priorityTextMap = {
    2: t('ms.minders.serial'),
    3: t('ms.minders.parallel'),
  };
  // 串行/并行枚举值与优先级映射
  const priorityMap = {
    [RunMode.SERIAL]: 2,
    [RunMode.PARALLEL]: 3,
  };

  /**
   * 处理执行方式切换
   * @param val 执行方式
   */
  function handleExecuteMethodMenuSelect(val: RunMode) {
    currentPriority.value = val;
    // 对节点执行优先级设置命令
    window.minder.execCommand('priority', priorityMap[val]);
    // 手动设置一次脑图的优先级 DOM 内容替换
    setCustomPriorityView(priorityTextMap);
  }

  const configFormRef = ref<FormInstance>();
  const configForm = ref<PlanMinderNodeData>();
  const resourcePoolOptions = ref<SelectOptionData[]>();
  const environmentOptions = computed(() => [
    {
      label: t('testPlan.testPlanIndex.defaultEnv'),
      value: 'NONE',
    },
    ...appStore.getEnvList.map((item) => ({ label: item.name, value: item.id })),
  ]);
  // 正在给 configForm 赋值，不触发表单变更
  const switchingConfigFormData = ref(false);
  const configFormUnsaved = ref(false);

  function handleConfigCancel() {
    extraVisible.value = false;
    activePlanSet.value = undefined;
    configForm.value = undefined;
    configFormUnsaved.value = false;
  }

  /**
   * 检查配置表单是否未保存
   */
  function checkConfigFormUnsaved() {
    const node: MinderJsonNode = window.minder.getSelectedNode();
    if (configFormUnsaved.value) {
      if (node?.data?.id !== configForm.value?.id) {
        // 避免重复提示
        Message.warning(t('ms.minders.unsavedTip'));
        // 前面激活的配置表单未保存，先取消选中当前节点，返回到上一个节点
        if (node) {
          window.minder.toggleSelect(node);
        }
        window.minder.selectById(configForm.value?.id);
      }
      return true;
    }
    return false;
  }

  function handleFloatMenuClose() {
    if (!checkConfigFormUnsaved()) {
      handleConfigCancel();
    }
  }

  /**
   * 处理节点选中
   * @param node 节点
   */
  function handleNodeSelect(node: PlanMinderNode) {
    if (checkConfigFormUnsaved()) {
      return;
    }
    checkNodeCanShowMenu(node);
    if (extraVisible.value) {
      if (node.data?.type === PlanMinderCollectionType.FUNCTIONAL && node.data?.level === 1) {
        // 功能用例分类没有配置
        extraVisible.value = false;
        return;
      }
      activePlanSet.value = node;
      switchingConfigFormData.value = true;
      configForm.value = cloneDeep(activePlanSet.value.data);
      nextTick(() => {
        switchingConfigFormData.value = false;
      });
    }
  }

  /**
   * 切换测试集配置显示
   */
  function toggleConfig() {
    if (checkConfigFormUnsaved()) {
      // 未保存配置不能通过配置按钮关闭配置抽屉
      Message.warning(t('ms.minders.unsavedTip'));
      return;
    }
    extraVisible.value = !extraVisible.value;
    const node: MinderJsonNode = window.minder.getSelectedNode();
    switchingConfigFormData.value = true;
    if (extraVisible.value) {
      activePlanSet.value = node as PlanMinderNode;
      configForm.value = cloneDeep(activePlanSet.value.data);
    } else {
      activePlanSet.value = undefined;
      configForm.value = undefined;
    }
    nextTick(() => {
      switchingConfigFormData.value = false;
    });
  }

  const currentSelectCase = ref<keyof typeof CaseLinkEnum>('FUNCTIONAL');
  const caseAssociateVisible = ref<boolean>(false);

  // 批量关联用例表格参数
  const selectedAssociateCasesParams = ref<AssociateCaseRequest>({
    excludeIds: [],
    selectIds: [],
    selectAll: false,
    condition: {},
    moduleIds: [],
    versionId: '',
    refId: '',
    projectId: '',
  });

  function writeAssociateCases(param: AssociateCaseRequest) {
    selectedAssociateCasesParams.value = { ...param };
    const node: PlanMinderNode = window.minder.getSelectedNode();
    node.data.associateDTOS = [
      {
        ids: param.selectIds,
        associateType:
          node.data.type === PlanMinderCollectionType.SCENARIO ? PlanMinderAssociateType.SCENARIO_CASE : node.data.type,
      },
    ];
    caseAssociateVisible.value = false;
  }

  function clearSelectedCases() {
    selectedAssociateCasesParams.value = {
      excludeIds: [],
      selectIds: [],
      selectAll: false,
      condition: {},
      moduleIds: [],
      versionId: '',
      refId: '',
      projectId: '',
    };
  }

  function associateCase() {
    const node: PlanMinderNode = window.minder.getSelectedNode();
    activePlanSet.value = node;
    switchingConfigFormData.value = true;
    configForm.value = cloneDeep(activePlanSet.value.data);
    extraVisible.value = true;
    currentSelectCase.value = node.data?.type || 'FUNCTIONAL';
    caseAssociateVisible.value = true;
    nextTick(() => {
      switchingConfigFormData.value = false;
    });
  }

  watch(
    () => [configForm.value, selectedAssociateCasesParams.value.selectIds],
    () => {
      if (!switchingConfigFormData.value && configForm.value) {
        configFormUnsaved.value = true;
      }
    },
    {
      deep: true,
    }
  );

  /**
   * 是否停止拖拽排序动作
   * @param dragNode 拖动节点
   * @param dropNode 目标节点
   */
  function stopArrangeDrag(dragNodes: MinderJsonNode | MinderJsonNode[], dropNode: MinderJsonNode) {
    if (!Array.isArray(dragNodes)) {
      dragNodes = [dragNodes];
    }
    for (let i = 0; i < dragNodes.length; i++) {
      const dragNode = (dragNodes as MinderJsonNode[])[i];
      if (dragNode.parent?.data?.id !== dropNode.parent?.data?.id) {
        // 不允许跨节点拖拽
        return true;
      }
      if (dragNode.data?.level === 2) {
        // 只允许拖拽同一节点内的测试集排序
        return false;
      }
    }
    return false;
  }

  /**
   * 脑图命令执行前拦截
   * @param event 命令执行事件
   */
  function handleBeforeExecCommand(event: MinderEvent) {
    if (event.commandName === 'movetoparent') {
      // 不允许跨节点拖拽
      event.stopPropagation();
    } else if (event.commandName === 'arrange') {
      // 拖拽排序拦截
      const dragNodes: MinderJsonNode[] = window.minder.getSelectedNodes();
      let dropNode: MinderJsonNode;
      if (dragNodes[0].parent?.children?.[event.commandArgs[0] as number]) {
        // 释放到目标节点后
        dropNode = dragNodes[0].parent?.children?.[event.commandArgs[0] as number];
      } else if (dragNodes[0].parent?.children?.[(event.commandArgs[0] as number) - 1]) {
        // 释放到目标节点前
        dropNode = dragNodes[0].parent?.children?.[(event.commandArgs[0] as number) - 1];
      } else {
        // 释放到最后一个节点
        dropNode = dragNodes[dragNodes.length - 1];
      }
      if (stopArrangeDrag(dragNodes, dropNode)) {
        event.stopPropagation();
      }
    }
  }

  /**
   * 初始化测试规划脑图
   */
  async function initMinder() {
    try {
      loading.value = true;
      const res = await getPlanMinder(props.planId);
      [importJson.value.root] = mapTree(res, (node, path, level) => {
        node.data = {
          ...node.data,
          level,
          isNew: false,
          changed: false,
          disabled: level < 2,
        };
        return node;
      });
      window.minder.importJson(importJson.value);
      window.minder.execCommand('template', Object.keys(window.kityminder.Minder.getTemplateList())[3]);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    } finally {
      loading.value = false;
    }
  }

  const tempMinderParams = ref({
    planId: props.planId,
    editList: [] as PlanMinderEditListItem[],
    deletedIds: [],
  });

  /**
   * 生成脑图保存的入参
   */
  function makeMinderParams(fullJson: MinderJson) {
    filterTree(fullJson.root.children, (node, nodeIndex) => {
      if (node.data.isNew) {
        tempMinderParams.value.editList.push({
          ...node.data,
          id: undefined,
          num: nodeIndex,
        });
      } else {
        tempMinderParams.value.editList.push({
          ...node.data,
          num: nodeIndex,
        });
      }
      return node.data.level < 2;
    });
    return tempMinderParams.value;
  }

  async function handleMinderSave(fullJson: MinderJson, callback: () => void) {
    try {
      loading.value = true;
      await editPlanMinder(makeMinderParams(fullJson));
      Message.success(t('common.saveSuccess'));
      handleConfigCancel();
      initMinder();
      callback();
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    } finally {
      loading.value = false;
    }
  }

  /**
   * 保存测试集配置
   */
  function handleConfigSave() {
    configFormRef.value?.validate((errors) => {
      if (!errors) {
        const node: MinderJsonNode = window.minder.getSelectedNode();
        if (node.data && configForm.value) {
          node.data = {
            ...node.data,
            ...cloneDeep(configForm.value),
          };
        }
        // 派发SAVE_MINDER事件触发脑图的保存处理
        minderStore.dispatchEvent(MinderEventName.SAVE_MINDER);
      }
    });
  }

  async function initResourcePoolList() {
    try {
      const res = await getPoolOption(appStore.currentProjectId);
      resourcePoolOptions.value = res.map((e) => ({ label: e.name, value: e.id }));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  }

  onBeforeMount(() => {
    initResourcePoolList();
    appStore.initEnvList();
  });

  onMounted(() => {
    initMinder();
    nextTick(() => {
      window.minder.on('contentchange', () => {
        // 异步执行，否则执行完，还会被重置
        setTimeout(() => {
          setCustomPriorityView(priorityTextMap);
        }, 0);
      });
      window.minder.on('selectionchange', () => {
        // 异步执行，否则执行完，还会被重置
        setTimeout(() => {
          setCustomPriorityView(priorityTextMap);
        }, 0);
      });
    });
  });
</script>

<style lang="less" scoped>
  :deep(.arco-form-item) {
    margin-bottom: 16px;
  }
</style>